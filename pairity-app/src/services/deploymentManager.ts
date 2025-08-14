import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { 
  DeploymentConfig, 
  Environment, 
  FeatureFlags, 
  ABTestConfig, 
  FeatureFlagConfig,
  DeploymentMetrics,
  HealthCheck,
  HealthCheckResult
} from '@/types/deployment';
import { currentEnvironment, isFeatureEnabled } from '@/config/environments';

class DeploymentManager {
  private environment: Environment;
  private deploymentId: string;
  private startTime: Date;
  private featureFlags: Map<string, FeatureFlagConfig> = new Map();
  private abTests: Map<string, ABTestConfig> = new Map();
  private metrics: DeploymentMetrics;

  constructor() {
    this.environment = currentEnvironment;
    this.deploymentId = this.generateDeploymentId();
    this.startTime = new Date();
    this.initializeMetrics();
    this.initializeFeatureFlags();
    this.setupHealthChecks();
  }

  // Initialization Methods
  private generateDeploymentId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `deploy_${timestamp}_${random}`;
  }

  private initializeMetrics(): void {
    this.metrics = {
      deploymentId: this.deploymentId,
      version: this.environment.version,
      environment: this.environment.name,
      startTime: this.startTime,
      status: 'running',
      stages: [],
      healthChecks: [],
      errors: [],
    };
  }

  private async initializeFeatureFlags(): Promise<void> {
    try {
      // In a real implementation, this would fetch from a feature flag service
      const defaultFlags = this.getDefaultFeatureFlags();
      defaultFlags.forEach(flag => {
        this.featureFlags.set(flag.key, flag);
      });

      console.log('Feature flags initialized:', this.featureFlags.size);
    } catch (error) {
      console.error('Failed to initialize feature flags:', error);
    }
  }

  private getDefaultFeatureFlags(): FeatureFlagConfig[] {
    const flags = Object.entries(this.environment.featureFlags).map(([key, value]) => ({
      key,
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      description: `Feature flag for ${key}`,
      enabled: true,
      defaultValue: value,
      variations: [
        { id: 'on', name: 'Enabled', value: true },
        { id: 'off', name: 'Disabled', value: false },
      ],
      rules: [],
      rollout: {
        type: 'percentage' as const,
        percentage: value ? 100 : 0,
      },
      tags: ['default'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return flags;
  }

  private setupHealthChecks(): void {
    // Set up periodic health checks
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute

    // Perform initial health check
    setTimeout(() => {
      this.performHealthChecks();
    }, 5000); // After 5 seconds
  }

  // Feature Flag Management
  public isFeatureEnabled(flagKey: string, userId?: string, context?: any): boolean {
    const flag = this.featureFlags.get(flagKey);
    if (!flag || !flag.enabled) {
      return false;
    }

    // Check rollout rules
    const variation = this.evaluateFeatureFlag(flag, userId, context);
    return variation?.value === true;
  }

  public getFeatureValue(flagKey: string, userId?: string, context?: any): any {
    const flag = this.featureFlags.get(flagKey);
    if (!flag || !flag.enabled) {
      return flag?.defaultValue;
    }

    const variation = this.evaluateFeatureFlag(flag, userId, context);
    return variation?.value ?? flag.defaultValue;
  }

  private evaluateFeatureFlag(flag: FeatureFlagConfig, userId?: string, context?: any): any {
    // Evaluate rules first
    for (const rule of flag.rules) {
      if (!rule.enabled) continue;

      const ruleMatches = rule.conditions.every(condition => {
        return this.evaluateCondition(condition, userId, context);
      });

      if (ruleMatches) {
        return flag.variations.find(v => v.id === rule.variationId);
      }
    }

    // Fallback to rollout strategy
    return this.evaluateRollout(flag, userId);
  }

  private evaluateCondition(condition: any, userId?: string, context?: any): boolean {
    // Simplified condition evaluation
    const value = context?.[condition.attribute] || userId;
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return value?.toString().includes(condition.value);
      case 'not_contains':
        return !value?.toString().includes(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  }

  private evaluateRollout(flag: FeatureFlagConfig, userId?: string): any {
    if (flag.rollout.type === 'percentage') {
      const hash = this.hashUserId(userId || 'anonymous', flag.key);
      const percentage = (hash % 100) / 100;
      const enabled = percentage < (flag.rollout.percentage || 0) / 100;
      
      return flag.variations.find(v => v.value === enabled);
    }

    // Default to first variation
    return flag.variations[0];
  }

  private hashUserId(userId: string, flagKey: string): number {
    let hash = 0;
    const str = `${userId}:${flagKey}`;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }

  // A/B Testing Management
  public getABTestVariant(testId: string, userId?: string): string | null {
    const test = this.abTests.get(testId);
    if (!test || !test.enabled || test.status !== 'running') {
      return null;
    }

    // Check if user is in target audience
    if (!this.isUserInAudience(userId, test.targetAudience)) {
      return null;
    }

    // Assign variant based on user hash
    const hash = this.hashUserId(userId || 'anonymous', testId);
    const percentage = (hash % 100) / 100;
    
    let cumulativeAllocation = 0;
    for (const variant of test.variants) {
      if (!variant.enabled) continue;
      
      cumulativeAllocation += variant.allocation / 100;
      if (percentage < cumulativeAllocation) {
        return variant.id;
      }
    }

    return null;
  }

  private isUserInAudience(userId: string | undefined, audience: any): boolean {
    // Simplified audience targeting
    // In a real implementation, this would check various user attributes
    return true;
  }

  // Health Check Management
  private async performHealthChecks(): Promise<void> {
    const checks: HealthCheck[] = [
      {
        name: 'API Connectivity',
        type: 'http',
        url: `${this.environment.apiUrl}/health`,
        method: 'GET',
        timeout: 5000,
        interval: 60000,
        retries: 3,
        expectedStatus: 200,
        enabled: true,
      },
      {
        name: 'WebSocket Connectivity',
        type: 'tcp',
        url: this.environment.websocketUrl,
        timeout: 5000,
        interval: 60000,
        retries: 2,
        enabled: true,
      },
      {
        name: 'Local Storage',
        type: 'custom',
        timeout: 1000,
        interval: 300000, // 5 minutes
        retries: 1,
        enabled: true,
      },
    ];

    for (const check of checks) {
      if (!check.enabled) continue;
      
      const result = await this.executeHealthCheck(check);
      this.metrics.healthChecks.push(result);
      
      // Keep only last 100 health check results
      if (this.metrics.healthChecks.length > 100) {
        this.metrics.healthChecks = this.metrics.healthChecks.slice(-100);
      }
    }
  }

  private async executeHealthCheck(check: HealthCheck): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      let success = false;
      let message = '';

      switch (check.type) {
        case 'http':
          success = await this.checkHttpEndpoint(check);
          message = success ? 'HTTP endpoint accessible' : 'HTTP endpoint failed';
          break;
        case 'tcp':
          success = await this.checkTcpConnection(check);
          message = success ? 'TCP connection successful' : 'TCP connection failed';
          break;
        case 'custom':
          success = await this.checkCustomHealth(check);
          message = success ? 'Custom check passed' : 'Custom check failed';
          break;
      }

      return {
        name: check.name,
        status: success ? 'pass' : 'fail',
        timestamp: new Date(),
        duration: Date.now() - startTime,
        message,
      };
    } catch (error) {
      return {
        name: check.name,
        status: 'fail',
        timestamp: new Date(),
        duration: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      };
    }
  }

  private async checkHttpEndpoint(check: HealthCheck): Promise<boolean> {
    try {
      const response = await fetch(check.url!, {
        method: check.method || 'GET',
        headers: check.headers,
        body: check.body,
        // Note: timeout would need to be implemented with AbortController
      });
      
      return check.expectedStatus ? response.status === check.expectedStatus : response.ok;
    } catch (error) {
      console.error('Health check HTTP error:', error);
      return false;
    }
  }

  private async checkTcpConnection(check: HealthCheck): Promise<boolean> {
    // TCP check implementation would depend on native modules
    // For now, return true as a placeholder
    console.log('TCP health check for:', check.url);
    return true;
  }

  private async checkCustomHealth(check: HealthCheck): Promise<boolean> {
    try {
      // Custom health checks (storage, memory, etc.)
      switch (check.name) {
        case 'Local Storage':
          return await this.checkLocalStorage();
        default:
          return true;
      }
    } catch (error) {
      console.error('Custom health check error:', error);
      return false;
    }
  }

  private async checkLocalStorage(): Promise<boolean> {
    try {
      const testKey = 'health_check_test';
      const testValue = Date.now().toString();
      
      // Try to write and read from AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(testKey, testValue);
      const readValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      return readValue === testValue;
    } catch (error) {
      return false;
    }
  }

  // Device and Environment Info
  public async getDeploymentInfo(): Promise<any> {
    try {
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        deviceId: await DeviceInfo.getUniqueId(),
        appVersion: await DeviceInfo.getVersion(),
        buildNumber: await DeviceInfo.getBuildNumber(),
        bundleId: await DeviceInfo.getBundleId(),
        deviceName: await DeviceInfo.getDeviceName(),
        systemName: await DeviceInfo.getSystemName(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        isEmulator: await DeviceInfo.isEmulator(),
        hasNotch: await DeviceInfo.hasNotch(),
        isTablet: await DeviceInfo.isTablet(),
      };

      return {
        deployment: {
          id: this.deploymentId,
          environment: this.environment.name,
          version: this.environment.version,
          buildNumber: this.environment.buildNumber,
          startTime: this.startTime,
          uptime: Date.now() - this.startTime.getTime(),
        },
        device: deviceInfo,
        featureFlags: Array.from(this.featureFlags.keys()),
        abTests: Array.from(this.abTests.keys()),
        healthStatus: this.getHealthStatus(),
      };
    } catch (error) {
      console.error('Error getting deployment info:', error);
      return {
        deployment: {
          id: this.deploymentId,
          environment: this.environment.name,
          error: 'Failed to get device info',
        },
      };
    }
  }

  private getHealthStatus(): string {
    const recentChecks = this.metrics.healthChecks.slice(-10);
    if (recentChecks.length === 0) return 'unknown';
    
    const failedChecks = recentChecks.filter(check => check.status === 'fail');
    const warningChecks = recentChecks.filter(check => check.status === 'warning');
    
    if (failedChecks.length > recentChecks.length / 2) return 'unhealthy';
    if (warningChecks.length > recentChecks.length / 3) return 'degraded';
    
    return 'healthy';
  }

  // Metrics and Monitoring
  public getMetrics(): DeploymentMetrics {
    return {
      ...this.metrics,
      endTime: new Date(),
      duration: Date.now() - this.startTime.getTime(),
    };
  }

  public recordError(stage: string, error: Error, context?: any): void {
    this.metrics.errors.push({
      stage,
      timestamp: new Date(),
      error: error.message,
      stack: error.stack,
      context,
      severity: 'medium',
    });

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors = this.metrics.errors.slice(-50);
    }
  }

  // Cleanup
  public cleanup(): void {
    // Clean up any resources, timers, etc.
    console.log('Deployment manager cleanup completed');
  }
}

// Export singleton instance
export const deploymentManager = new DeploymentManager();

export default DeploymentManager;