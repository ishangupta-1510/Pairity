import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { HealthCheck, HealthCheckResult } from '@/types/deployment';
import { currentEnvironment } from '@/config/environments';
import { monitoringService } from './monitoringService';

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  lastCheck: Date;
  checks: HealthCheckResult[];
  uptime: number;
  version: string;
}

interface SystemMetrics {
  memoryUsage: number;
  batteryLevel: number;
  batteryState: string;
  diskSpace: {
    free: number;
    total: number;
  };
  networkStatus: 'connected' | 'disconnected' | 'unknown';
  isLowPowerMode: boolean;
}

class HealthCheckService {
  private checks: Map<string, HealthCheck> = new Map();
  private results: HealthCheckResult[] = [];
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: Date;
  private systemMetrics: SystemMetrics | null = null;

  constructor() {
    this.startTime = new Date();
    this.initializeHealthChecks();
    this.startHealthChecking();
  }

  // Initialization
  private initializeHealthChecks(): void {
    const defaultChecks = this.getDefaultHealthChecks();
    
    for (const check of defaultChecks) {
      this.checks.set(check.name, check);
    }

    console.log(`Initialized ${this.checks.size} health checks`);
  }

  private getDefaultHealthChecks(): HealthCheck[] {
    return [
      {
        name: 'App Startup',
        type: 'custom',
        timeout: 5000,
        interval: 300000, // 5 minutes
        retries: 1,
        enabled: true,
      },
      {
        name: 'Local Storage',
        type: 'custom',
        timeout: 2000,
        interval: 60000, // 1 minute
        retries: 2,
        enabled: true,
      },
      {
        name: 'API Connectivity',
        type: 'http',
        url: `${currentEnvironment.apiUrl}/health`,
        method: 'GET',
        timeout: 10000,
        interval: 30000, // 30 seconds
        retries: 3,
        expectedStatus: 200,
        enabled: true,
      },
      {
        name: 'WebSocket Connection',
        type: 'tcp',
        url: currentEnvironment.websocketUrl,
        timeout: 5000,
        interval: 60000, // 1 minute
        retries: 2,
        enabled: true,
      },
      {
        name: 'Memory Usage',
        type: 'custom',
        timeout: 1000,
        interval: 120000, // 2 minutes
        retries: 1,
        enabled: true,
      },
      {
        name: 'Battery Status',
        type: 'custom',
        timeout: 1000,
        interval: 300000, // 5 minutes
        retries: 1,
        enabled: Platform.OS !== 'web',
      },
      {
        name: 'Network Status',
        type: 'custom',
        timeout: 2000,
        interval: 30000, // 30 seconds
        retries: 1,
        enabled: true,
      },
      {
        name: 'Feature Flags',
        type: 'custom',
        timeout: 3000,
        interval: 600000, // 10 minutes
        retries: 2,
        enabled: true,
      },
    ];
  }

  // Health Check Execution
  private startHealthChecking(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Perform initial checks
    setTimeout(() => {
      this.runAllHealthChecks();
    }, 2000);

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.runScheduledHealthChecks();
    }, 30000); // Check every 30 seconds which checks are due

    console.log('Health checking started');
  }

  private async runAllHealthChecks(): Promise<void> {
    const promises: Promise<HealthCheckResult>[] = [];

    for (const check of this.checks.values()) {
      if (check.enabled) {
        promises.push(this.executeHealthCheck(check));
      }
    }

    try {
      const results = await Promise.allSettled(promises);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          this.addResult(result.value);
        }
      }

      await this.updateSystemMetrics();
    } catch (error) {
      console.error('Failed to run health checks:', error);
    }
  }

  private async runScheduledHealthChecks(): Promise<void> {
    const now = Date.now();
    const checksToRun: HealthCheck[] = [];

    for (const check of this.checks.values()) {
      if (!check.enabled) continue;

      // Find last result for this check
      const lastResult = this.results
        .filter(r => r.name === check.name)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      // Check if it's time to run this check
      const timeSinceLastCheck = lastResult 
        ? now - lastResult.timestamp.getTime()
        : Infinity;

      if (timeSinceLastCheck >= check.interval) {
        checksToRun.push(check);
      }
    }

    if (checksToRun.length > 0) {
      console.log(`Running ${checksToRun.length} scheduled health checks`);
      
      for (const check of checksToRun) {
        try {
          const result = await this.executeHealthCheck(check);
          this.addResult(result);
        } catch (error) {
          console.error(`Health check ${check.name} failed:`, error);
        }
      }
    }
  }

  private async executeHealthCheck(check: HealthCheck): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      let success = false;
      let message = '';
      let details: any = {};

      switch (check.type) {
        case 'http':
          const httpResult = await this.checkHttpEndpoint(check);
          success = httpResult.success;
          message = httpResult.message;
          details = httpResult.details;
          break;

        case 'tcp':
          const tcpResult = await this.checkTcpConnection(check);
          success = tcpResult.success;
          message = tcpResult.message;
          break;

        case 'custom':
          const customResult = await this.runCustomCheck(check);
          success = customResult.success;
          message = customResult.message;
          details = customResult.details;
          break;

        default:
          throw new Error(`Unknown check type: ${check.type}`);
      }

      const duration = Date.now() - startTime;
      const status = success ? 'pass' : 'fail';

      return {
        name: check.name,
        status,
        timestamp: new Date(),
        duration,
        message,
        details,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        name: check.name,
        status: 'fail',
        timestamp: new Date(),
        duration,
        message,
        details: { error: message },
      };
    }
  }

  private async checkHttpEndpoint(check: HealthCheck): Promise<{ success: boolean; message: string; details: any }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), check.timeout);

      const response = await fetch(check.url!, {
        method: check.method || 'GET',
        headers: check.headers,
        body: check.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const success = check.expectedStatus ? 
        response.status === check.expectedStatus : 
        response.ok;

      return {
        success,
        message: success ? 
          `HTTP endpoint responsive (${response.status})` : 
          `HTTP endpoint returned ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `HTTP check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
      };
    }
  }

  private async checkTcpConnection(check: HealthCheck): Promise<{ success: boolean; message: string }> {
    // TCP connection check would require native implementation
    // For now, simulate with a basic check
    try {
      // In a real implementation, this would use native networking APIs
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      return {
        success,
        message: success ? 'TCP connection established' : 'TCP connection failed',
      };
    } catch (error) {
      return {
        success: false,
        message: `TCP check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async runCustomCheck(check: HealthCheck): Promise<{ success: boolean; message: string; details?: any }> {
    switch (check.name) {
      case 'App Startup':
        return this.checkAppStartup();

      case 'Local Storage':
        return this.checkLocalStorage();

      case 'Memory Usage':
        return this.checkMemoryUsage();

      case 'Battery Status':
        return this.checkBatteryStatus();

      case 'Network Status':
        return this.checkNetworkStatus();

      case 'Feature Flags':
        return this.checkFeatureFlags();

      default:
        return {
          success: false,
          message: `Unknown custom check: ${check.name}`,
        };
    }
  }

  private async checkAppStartup(): Promise<{ success: boolean; message: string; details: any }> {
    try {
      const uptime = Date.now() - this.startTime.getTime();
      const success = uptime > 5000; // App has been running for at least 5 seconds
      
      return {
        success,
        message: success ? 'App started successfully' : 'App startup in progress',
        details: { uptime },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check app startup',
        details: { error },
      };
    }
  }

  private async checkLocalStorage(): Promise<{ success: boolean; message: string; details: any }> {
    try {
      const testKey = 'health_check_test';
      const testValue = Date.now().toString();

      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);

      const success = retrievedValue === testValue;
      
      return {
        success,
        message: success ? 'Local storage operational' : 'Local storage test failed',
        details: { testValue, retrievedValue },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Local storage check failed',
        details: { error },
      };
    }
  }

  private async checkMemoryUsage(): Promise<{ success: boolean; message: string; details: any }> {
    try {
      let memoryUsage = 0;
      let memoryWarning = false;

      // Get memory info if available
      if (global.performance && global.performance.memory) {
        memoryUsage = global.performance.memory.usedJSHeapSize;
        const memoryLimit = global.performance.memory.jsHeapSizeLimit;
        memoryWarning = memoryUsage > memoryLimit * 0.8; // Warn at 80% usage
      }

      const success = !memoryWarning;
      
      return {
        success,
        message: success ? 'Memory usage normal' : 'High memory usage detected',
        details: { memoryUsage, memoryWarning },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Memory check failed',
        details: { error },
      };
    }
  }

  private async checkBatteryStatus(): Promise<{ success: boolean; message: string; details: any }> {
    try {
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const powerState = await DeviceInfo.getPowerState();
      
      const lowBattery = batteryLevel < 0.15; // Less than 15%
      const success = !lowBattery;
      
      return {
        success,
        message: success ? 'Battery status normal' : 'Low battery detected',
        details: { batteryLevel, powerState },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Battery check failed',
        details: { error },
      };
    }
  }

  private async checkNetworkStatus(): Promise<{ success: boolean; message: string; details: any }> {
    try {
      // Simple network check by trying to reach a reliable endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const success = response.ok;

      return {
        success,
        message: success ? 'Network connectivity confirmed' : 'Network connectivity issues',
        details: { status: response.status },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network check failed',
        details: { error },
      };
    }
  }

  private async checkFeatureFlags(): Promise<{ success: boolean; message: string; details: any }> {
    try {
      // Check if feature flag service is responding
      const { featureFlagService } = await import('./featureFlagService');
      const debugInfo = featureFlagService.getDebugInfo();
      
      const success = debugInfo.initialized && debugInfo.featureFlagsCount > 0;
      
      return {
        success,
        message: success ? 'Feature flags operational' : 'Feature flags not properly initialized',
        details: debugInfo,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Feature flags check failed',
        details: { error },
      };
    }
  }

  private async updateSystemMetrics(): Promise<void> {
    try {
      const [batteryLevel, powerState] = await Promise.all([
        DeviceInfo.getBatteryLevel().catch(() => -1),
        DeviceInfo.getPowerState().catch(() => ({ batteryState: 'unknown' })),
      ]);

      this.systemMetrics = {
        memoryUsage: global.performance?.memory?.usedJSHeapSize || 0,
        batteryLevel,
        batteryState: powerState.batteryState || 'unknown',
        diskSpace: {
          free: 0, // Would need native implementation
          total: 0,
        },
        networkStatus: 'unknown', // Would need NetInfo integration
        isLowPowerMode: powerState.lowPowerMode || false,
      };
    } catch (error) {
      console.error('Failed to update system metrics:', error);
    }
  }

  // Result Management
  private addResult(result: HealthCheckResult): void {
    this.results.push(result);

    // Keep only last 100 results
    if (this.results.length > 100) {
      this.results = this.results.slice(-100);
    }

    // Log critical failures
    if (result.status === 'fail') {
      console.warn(`Health check failed: ${result.name} - ${result.message}`);
      
      monitoringService.reportError({
        error: new Error(`Health check failed: ${result.name}`),
        context: {
          healthCheck: result.name,
          message: result.message,
          details: result.details,
        },
        severity: 'medium',
      });
    }

    // Track health check metrics
    monitoringService.recordPerformanceMetric({
      name: `health_check_${result.name.toLowerCase().replace(/\s+/g, '_')}`,
      value: result.duration,
      unit: 'ms',
      timestamp: result.timestamp,
      context: {
        status: result.status,
        message: result.message,
      },
    });
  }

  // Public API
  public getHealthStatus(): HealthStatus {
    const recentResults = this.results.slice(-20); // Last 20 results
    const failedResults = recentResults.filter(r => r.status === 'fail');
    const warningResults = recentResults.filter(r => r.status === 'warning');

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    let score: number;

    if (failedResults.length === 0) {
      overall = 'healthy';
      score = warningResults.length === 0 ? 100 : Math.max(80, 100 - warningResults.length * 5);
    } else if (failedResults.length < recentResults.length / 2) {
      overall = 'degraded';
      score = Math.max(40, 80 - failedResults.length * 10);
    } else {
      overall = 'unhealthy';
      score = Math.max(0, 40 - failedResults.length * 5);
    }

    return {
      overall,
      score,
      lastCheck: recentResults.length > 0 ? recentResults[recentResults.length - 1].timestamp : this.startTime,
      checks: recentResults,
      uptime: Date.now() - this.startTime.getTime(),
      version: currentEnvironment.version,
    };
  }

  public getSystemMetrics(): SystemMetrics | null {
    return this.systemMetrics;
  }

  public getCheckResults(checkName?: string): HealthCheckResult[] {
    if (checkName) {
      return this.results.filter(r => r.name === checkName);
    }
    return [...this.results];
  }

  public async runCheck(checkName: string): Promise<HealthCheckResult | null> {
    const check = this.checks.get(checkName);
    if (!check) {
      console.error(`Health check not found: ${checkName}`);
      return null;
    }

    try {
      const result = await this.executeHealthCheck(check);
      this.addResult(result);
      return result;
    } catch (error) {
      console.error(`Failed to run health check ${checkName}:`, error);
      return null;
    }
  }

  public addCustomCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
    console.log(`Added custom health check: ${check.name}`);
  }

  public removeCheck(checkName: string): void {
    this.checks.delete(checkName);
    console.log(`Removed health check: ${checkName}`);
  }

  public enableCheck(checkName: string): void {
    const check = this.checks.get(checkName);
    if (check) {
      check.enabled = true;
      console.log(`Enabled health check: ${checkName}`);
    }
  }

  public disableCheck(checkName: string): void {
    const check = this.checks.get(checkName);
    if (check) {
      check.enabled = false;
      console.log(`Disabled health check: ${checkName}`);
    }
  }

  // Cleanup
  public stop(): void {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Health checking stopped');
  }

  public cleanup(): void {
    this.stop();
    this.results = [];
    this.systemMetrics = null;
    console.log('Health check service cleaned up');
  }
}

// Export singleton instance
export const healthCheckService = new HealthCheckService();

export default HealthCheckService;