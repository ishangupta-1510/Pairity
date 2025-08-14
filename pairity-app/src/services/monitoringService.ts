import { Platform } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';
import { currentEnvironment } from '@/config/environments';
import { MonitoringConfig, AnalyticsConfig, CrashReportingConfig } from '@/types/deployment';

interface ErrorInfo {
  error: Error;
  errorInfo?: any;
  context?: Record<string, any>;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
}

interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
  userId?: string;
  userProperties?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

class MonitoringService {
  private config: MonitoringConfig;
  private analyticsConfig: AnalyticsConfig;
  private crashConfig: CrashReportingConfig;
  private isInitialized: boolean = false;
  private performanceMetrics: PerformanceMetric[] = [];
  private errorQueue: ErrorInfo[] = [];
  private analyticsQueue: AnalyticsEvent[] = [];

  constructor() {
    this.config = {
      enabled: currentEnvironment.crashReportingEnabled,
      sentryDsn: process.env.SENTRY_DSN,
      logLevel: currentEnvironment.debugMode ? 'debug' : 'error',
      errorReporting: true,
      performanceMonitoring: true,
      networkMonitoring: true,
      crashReporting: true,
      userTracking: currentEnvironment.analyticsEnabled,
    };

    this.analyticsConfig = {
      enabled: currentEnvironment.analyticsEnabled,
      providers: [
        {
          name: 'firebase',
          apiKey: process.env.FIREBASE_API_KEY || '',
          enabled: true,
          events: ['screen_view', 'user_engagement', 'app_open'],
        },
      ],
      customEvents: true,
      userProperties: true,
      screenTracking: true,
      crashTracking: true,
      performanceTracking: true,
    };

    this.crashConfig = {
      enabled: currentEnvironment.crashReportingEnabled,
      provider: 'crashlytics',
      release: currentEnvironment.version,
      environment: currentEnvironment.name,
      breadcrumbs: true,
      attachments: true,
    };

    this.initialize();
  }

  // Initialization
  private async initialize(): Promise<void> {
    try {
      if (!this.config.enabled) {
        console.log('Monitoring service disabled');
        return;
      }

      await this.initializeCrashlytics();
      await this.initializeAnalytics();
      await this.initializePerformanceMonitoring();

      this.isInitialized = true;
      console.log('Monitoring service initialized successfully');

      // Process queued items
      this.processErrorQueue();
      this.processAnalyticsQueue();
    } catch (error) {
      console.error('Failed to initialize monitoring service:', error);
    }
  }

  private async initializeCrashlytics(): Promise<void> {
    if (!this.crashConfig.enabled) return;

    try {
      // Set crash collection enabled
      await crashlytics().setCrashlyticsCollectionEnabled(true);

      // Set custom attributes
      await crashlytics().setAttributes({
        environment: this.crashConfig.environment || 'unknown',
        version: this.crashConfig.release || 'unknown',
        platform: Platform.OS,
      });

      console.log('Crashlytics initialized');
    } catch (error) {
      console.error('Failed to initialize Crashlytics:', error);
    }
  }

  private async initializeAnalytics(): Promise<void> {
    if (!this.analyticsConfig.enabled) return;

    try {
      // Set analytics collection enabled
      await analytics().setAnalyticsCollectionEnabled(true);

      // Set default event parameters
      await analytics().setDefaultEventParameters({
        environment: currentEnvironment.name,
        app_version: currentEnvironment.version,
        platform: Platform.OS,
      });

      console.log('Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize Analytics:', error);
    }
  }

  private async initializePerformanceMonitoring(): Promise<void> {
    if (!this.config.performanceMonitoring) return;

    try {
      // Set up performance monitoring
      // This would integrate with Firebase Performance or similar service
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  // Error Reporting
  public reportError(errorInfo: ErrorInfo): void {
    if (!this.isInitialized) {
      this.errorQueue.push(errorInfo);
      return;
    }

    try {
      this.recordCrash(errorInfo);
      this.logError(errorInfo);
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }

  private async recordCrash(errorInfo: ErrorInfo): Promise<void> {
    if (!this.crashConfig.enabled) return;

    try {
      // Set user context
      if (errorInfo.userId) {
        await crashlytics().setUserId(errorInfo.userId);
      }

      // Set custom attributes
      if (errorInfo.context) {
        await crashlytics().setAttributes(errorInfo.context);
      }

      // Set custom keys
      if (errorInfo.tags) {
        for (const [key, value] of Object.entries(errorInfo.tags)) {
          await crashlytics().setAttribute(key, value);
        }
      }

      // Record the error
      crashlytics().recordError(errorInfo.error);

      // Add breadcrumb for context
      if (this.crashConfig.breadcrumbs) {
        crashlytics().log(`Error reported: ${errorInfo.error.message}`);
      }
    } catch (error) {
      console.error('Failed to record crash:', error);
    }
  }

  private logError(errorInfo: ErrorInfo): void {
    const logLevel = this.getSeverityLogLevel(errorInfo.severity || 'medium');
    
    if (this.shouldLog(logLevel)) {
      console.error(`[${logLevel.toUpperCase()}] ${errorInfo.error.message}`, {
        error: errorInfo.error,
        context: errorInfo.context,
        userId: errorInfo.userId,
        severity: errorInfo.severity,
        tags: errorInfo.tags,
        stack: errorInfo.error.stack,
      });
    }
  }

  private getSeverityLogLevel(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'warn';
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  // Analytics Tracking
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) {
      this.analyticsQueue.push(event);
      return;
    }

    try {
      this.recordAnalyticsEvent(event);
      this.logEvent(event);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  private async recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.analyticsConfig.enabled) return;

    try {
      // Set user properties if provided
      if (event.userProperties) {
        await analytics().setUserProperties(event.userProperties);
      }

      // Set user ID if provided
      if (event.userId) {
        await analytics().setUserId(event.userId);
      }

      // Log the event
      await analytics().logEvent(event.eventName, event.parameters);
    } catch (error) {
      console.error('Failed to record analytics event:', error);
    }
  }

  private logEvent(event: AnalyticsEvent): void {
    if (this.shouldLog('info')) {
      console.log(`[ANALYTICS] ${event.eventName}`, {
        parameters: event.parameters,
        userId: event.userId,
        userProperties: event.userProperties,
      });
    }
  }

  // Performance Monitoring
  public recordPerformanceMetric(metric: PerformanceMetric): void {
    try {
      this.performanceMetrics.push(metric);
      
      // Keep only last 1000 metrics
      if (this.performanceMetrics.length > 1000) {
        this.performanceMetrics = this.performanceMetrics.slice(-1000);
      }

      this.logPerformanceMetric(metric);
      this.reportPerformanceMetric(metric);
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  private logPerformanceMetric(metric: PerformanceMetric): void {
    if (this.shouldLog('info')) {
      console.log(`[PERFORMANCE] ${metric.name}: ${metric.value}${metric.unit}`, {
        context: metric.context,
        timestamp: metric.timestamp,
      });
    }
  }

  private async reportPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    if (!this.config.performanceMonitoring) return;

    try {
      // Report to performance monitoring service
      // This would integrate with Firebase Performance or similar
      
      // For now, track as analytics event
      if (this.analyticsConfig.enabled && this.analyticsConfig.performanceTracking) {
        await analytics().logEvent('performance_metric', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_unit: metric.unit,
          ...metric.context,
        });
      }
    } catch (error) {
      console.error('Failed to report performance metric:', error);
    }
  }

  // User Context
  public setUser(userId: string, userProperties?: Record<string, any>): void {
    try {
      if (this.crashConfig.enabled) {
        crashlytics().setUserId(userId);
        
        if (userProperties) {
          crashlytics().setAttributes(userProperties);
        }
      }

      if (this.analyticsConfig.enabled) {
        analytics().setUserId(userId);
        
        if (userProperties) {
          analytics().setUserProperties(userProperties);
        }
      }

      console.log('User context set:', userId);
    } catch (error) {
      console.error('Failed to set user context:', error);
    }
  }

  public clearUser(): void {
    try {
      if (this.crashConfig.enabled) {
        crashlytics().setUserId('');
      }

      if (this.analyticsConfig.enabled) {
        analytics().setUserId(null);
      }

      console.log('User context cleared');
    } catch (error) {
      console.error('Failed to clear user context:', error);
    }
  }

  // Breadcrumbs
  public addBreadcrumb(message: string, category?: string, level?: string): void {
    try {
      if (this.crashConfig.enabled && this.crashConfig.breadcrumbs) {
        crashlytics().log(`[${category || 'default'}] ${message}`);
      }

      if (this.shouldLog('debug')) {
        console.log(`[BREADCRUMB] [${category || 'default'}] ${message}`);
      }
    } catch (error) {
      console.error('Failed to add breadcrumb:', error);
    }
  }

  // Network Monitoring
  public recordNetworkRequest(
    url: string,
    method: string,
    statusCode: number,
    duration: number,
    requestSize?: number,
    responseSize?: number
  ): void {
    try {
      const metric: PerformanceMetric = {
        name: 'network_request',
        value: duration,
        unit: 'ms',
        timestamp: new Date(),
        context: {
          url,
          method,
          status_code: statusCode,
          request_size: requestSize,
          response_size: responseSize,
        },
      };

      this.recordPerformanceMetric(metric);

      // Track network errors
      if (statusCode >= 400) {
        this.reportError({
          error: new Error(`Network error: ${statusCode} ${method} ${url}`),
          context: {
            url,
            method,
            statusCode,
            duration,
          },
          severity: statusCode >= 500 ? 'high' : 'medium',
          tags: {
            type: 'network_error',
            method,
            status: statusCode.toString(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to record network request:', error);
    }
  }

  // Screen Tracking
  public trackScreen(screenName: string, screenClass?: string): void {
    try {
      this.trackEvent({
        eventName: 'screen_view',
        parameters: {
          screen_name: screenName,
          screen_class: screenClass || screenName,
        },
      });

      this.addBreadcrumb(`Navigated to ${screenName}`, 'navigation');
    } catch (error) {
      console.error('Failed to track screen:', error);
    }
  }

  // Queue Processing
  private processErrorQueue(): void {
    while (this.errorQueue.length > 0) {
      const errorInfo = this.errorQueue.shift();
      if (errorInfo) {
        this.reportError(errorInfo);
      }
    }
  }

  private processAnalyticsQueue(): void {
    while (this.analyticsQueue.length > 0) {
      const event = this.analyticsQueue.shift();
      if (event) {
        this.trackEvent(event);
      }
    }
  }

  // Health Check
  public getHealthStatus(): any {
    return {
      initialized: this.isInitialized,
      crashReportingEnabled: this.crashConfig.enabled,
      analyticsEnabled: this.analyticsConfig.enabled,
      performanceMonitoringEnabled: this.config.performanceMonitoring,
      environment: this.crashConfig.environment,
      version: this.crashConfig.release,
      queueSizes: {
        errors: this.errorQueue.length,
        analytics: this.analyticsQueue.length,
        performanceMetrics: this.performanceMetrics.length,
      },
    };
  }

  // Cleanup
  public cleanup(): void {
    try {
      // Process remaining queue items
      this.processErrorQueue();
      this.processAnalyticsQueue();

      // Clear metrics
      this.performanceMetrics = [];

      console.log('Monitoring service cleaned up');
    } catch (error) {
      console.error('Failed to cleanup monitoring service:', error);
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Convenience methods
export const reportError = (error: Error, context?: Record<string, any>, severity?: string) => {
  monitoringService.reportError({
    error,
    context,
    severity: severity as any,
  });
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  monitoringService.trackEvent({
    eventName,
    parameters,
  });
};

export const recordPerformance = (name: string, value: number, unit: string = 'ms') => {
  monitoringService.recordPerformanceMetric({
    name,
    value,
    unit,
    timestamp: new Date(),
  });
};

export const setUser = (userId: string, properties?: Record<string, any>) => {
  monitoringService.setUser(userId, properties);
};

export const trackScreen = (screenName: string) => {
  monitoringService.trackScreen(screenName);
};

export const addBreadcrumb = (message: string, category?: string) => {
  monitoringService.addBreadcrumb(message, category);
};

export default MonitoringService;