import { Environment, FeatureFlags } from '@/types/deployment';

// Base feature flags - can be overridden per environment
const baseFeatureFlags: FeatureFlags = {
  enablePremiumFeatures: true,
  enableVideoChat: false,
  enableSuperBoost: true,
  enableAIMatching: false,
  enableVoiceMessages: true,
  enableLocationSharing: true,
  enableReadReceipts: true,
  enableTypingIndicators: true,
  enablePushNotifications: true,
  enableBiometricAuth: true,
  enableDarkModeToggle: true,
  enableAccessibilityFeatures: true,
  enablePerformanceMonitoring: false,
  enableABTesting: false,
  maintenanceMode: false,
};

// Development Environment
export const developmentConfig: Environment = {
  name: 'development',
  apiUrl: 'http://localhost:3000/api',
  websocketUrl: 'ws://localhost:3000/ws',
  debugMode: true,
  analyticsEnabled: false,
  crashReportingEnabled: false,
  version: '1.0.0-dev',
  buildNumber: '1',
  featureFlags: {
    ...baseFeatureFlags,
    enableVideoChat: true, // Enable in dev for testing
    enableAIMatching: true, // Enable in dev for testing
    enablePerformanceMonitoring: true, // Enable in dev
    enableABTesting: true, // Enable in dev for testing
    maintenanceMode: false,
  },
};

// Staging Environment
export const stagingConfig: Environment = {
  name: 'staging',
  apiUrl: 'https://staging-api.pairity.com/api',
  websocketUrl: 'wss://staging-api.pairity.com/ws',
  debugMode: false,
  analyticsEnabled: true,
  crashReportingEnabled: true,
  version: '1.0.0-staging',
  buildNumber: '2',
  featureFlags: {
    ...baseFeatureFlags,
    enableVideoChat: false, // Staging mirrors production mostly
    enableAIMatching: false,
    enablePerformanceMonitoring: true,
    enableABTesting: true,
    maintenanceMode: false,
  },
};

// Production Environment
export const productionConfig: Environment = {
  name: 'production',
  apiUrl: 'https://api.pairity.com/api',
  websocketUrl: 'wss://api.pairity.com/ws',
  debugMode: false,
  analyticsEnabled: true,
  crashReportingEnabled: true,
  version: '1.0.0',
  buildNumber: '3',
  featureFlags: {
    ...baseFeatureFlags,
    enableVideoChat: false, // Disabled until ready
    enableAIMatching: false, // Disabled until ready
    enablePerformanceMonitoring: true,
    enableABTesting: true,
    maintenanceMode: false,
  },
};

// Environment Detection
export const getCurrentEnvironment = (): Environment => {
  // In React Native, you can use different methods to detect environment
  // This could be based on build configuration, environment variables, etc.
  
  if (__DEV__) {
    return developmentConfig;
  }
  
  // Check for staging indicators (could be bundle identifier, env vars, etc.)
  const bundleId = getBundleId(); // This would be implemented based on platform
  if (bundleId?.includes('staging')) {
    return stagingConfig;
  }
  
  return productionConfig;
};

// Helper function to get bundle ID (platform specific)
const getBundleId = (): string | undefined => {
  // This would need to be implemented using native modules
  // For now, return undefined
  return undefined;
};

// Environment-specific configurations
export const getApiConfig = () => {
  const env = getCurrentEnvironment();
  return {
    baseURL: env.apiUrl,
    timeout: env.name === 'development' ? 30000 : 10000,
    retries: env.name === 'production' ? 3 : 1,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-App-Version': env.version,
      'X-Build-Number': env.buildNumber,
      'X-Environment': env.name,
    },
  };
};

export const getWebSocketConfig = () => {
  const env = getCurrentEnvironment();
  return {
    url: env.websocketUrl,
    reconnectInterval: 5000,
    maxReconnectAttempts: env.name === 'production' ? 10 : 5,
    heartbeatInterval: 30000,
    connectionTimeout: 10000,
  };
};

export const getLoggingConfig = () => {
  const env = getCurrentEnvironment();
  return {
    level: env.debugMode ? 'debug' : 'error',
    enableConsoleLog: env.debugMode,
    enableFileLog: env.name !== 'development',
    enableRemoteLog: env.crashReportingEnabled,
    maxLogFiles: 5,
    maxLogSize: 1024 * 1024 * 10, // 10MB
  };
};

export const getCacheConfig = () => {
  const env = getCurrentEnvironment();
  return {
    userProfileTTL: env.name === 'production' ? 300000 : 60000, // 5 min prod, 1 min dev
    discoverUsersTTL: env.name === 'production' ? 600000 : 30000, // 10 min prod, 30 sec dev
    chatMessagesTTL: 86400000, // 24 hours
    imageCacheTTL: env.name === 'production' ? 3600000 : 300000, // 1 hour prod, 5 min dev
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    enableDiskCache: true,
    enableMemoryCache: true,
  };
};

export const getSecurityConfig = () => {
  const env = getCurrentEnvironment();
  return {
    enableCertificatePinning: env.name === 'production',
    enableRequestSigning: env.name === 'production',
    jailbreakDetection: env.name === 'production',
    debuggerDetection: env.name === 'production',
    enableBiometric: env.featureFlags.enableBiometricAuth,
    sessionTimeout: env.name === 'production' ? 3600000 : 86400000, // 1 hour prod, 24 hours dev
    maxFailedAttempts: 5,
    lockoutDuration: 300000, // 5 minutes
  };
};

export const getPerformanceConfig = () => {
  const env = getCurrentEnvironment();
  return {
    enableTracking: env.featureFlags.enablePerformanceMonitoring,
    sampleRate: env.name === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    enableMemoryTracking: true,
    enableNetworkTracking: true,
    enableRenderTracking: env.debugMode,
    maxBreadcrumbs: 50,
    enableProfilingInDev: env.debugMode,
  };
};

export const getAnalyticsConfig = () => {
  const env = getCurrentEnvironment();
  return {
    enabled: env.analyticsEnabled,
    trackScreenViews: true,
    trackUserProperties: true,
    trackCustomEvents: true,
    enableDebugMode: env.debugMode,
    flushInterval: env.name === 'production' ? 60000 : 10000, // 1 min prod, 10 sec dev
    maxEventsPerBatch: 50,
    enableOfflineQueue: true,
  };
};

// Feature Flag Helpers
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  const env = getCurrentEnvironment();
  return env.featureFlags[flag];
};

export const getFeatureConfig = <T>(flag: keyof FeatureFlags, config: T): T | null => {
  return isFeatureEnabled(flag) ? config : null;
};

// Environment Info for Debugging
export const getEnvironmentInfo = () => {
  const env = getCurrentEnvironment();
  return {
    environment: env.name,
    version: env.version,
    buildNumber: env.buildNumber,
    debugMode: env.debugMode,
    apiUrl: env.apiUrl,
    featureFlags: env.featureFlags,
    timestamp: new Date().toISOString(),
  };
};

// Export current environment
export const currentEnvironment = getCurrentEnvironment();

export default {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
  current: currentEnvironment,
  getApiConfig,
  getWebSocketConfig,
  getLoggingConfig,
  getCacheConfig,
  getSecurityConfig,
  getPerformanceConfig,
  getAnalyticsConfig,
  isFeatureEnabled,
  getFeatureConfig,
  getEnvironmentInfo,
};