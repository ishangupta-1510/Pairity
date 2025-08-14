export interface Environment {
  name: 'development' | 'staging' | 'production';
  apiUrl: string;
  websocketUrl: string;
  debugMode: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  featureFlags: FeatureFlags;
  version: string;
  buildNumber: string;
}

export interface FeatureFlags {
  enablePremiumFeatures: boolean;
  enableVideoChat: boolean;
  enableSuperBoost: boolean;
  enableAIMatching: boolean;
  enableVoiceMessages: boolean;
  enableLocationSharing: boolean;
  enableReadReceipts: boolean;
  enableTypingIndicators: boolean;
  enablePushNotifications: boolean;
  enableBiometricAuth: boolean;
  enableDarkModeToggle: boolean;
  enableAccessibilityFeatures: boolean;
  enablePerformanceMonitoring: boolean;
  enableABTesting: boolean;
  maintenanceMode: boolean;
}

export interface DeploymentConfig {
  environment: Environment;
  secrets: DeploymentSecrets;
  monitoring: MonitoringConfig;
  analytics: AnalyticsConfig;
  crashReporting: CrashReportingConfig;
  performance: PerformanceConfig;
}

export interface DeploymentSecrets {
  apiKeys: {
    sentry?: string;
    analytics?: string;
    firebase?: string;
    appsflyer?: string;
    amplitude?: string;
    mixpanel?: string;
  };
  oauth: {
    googleClientId?: string;
    facebookAppId?: string;
    appleClientId?: string;
  };
  services: {
    pusherKey?: string;
    twilioSid?: string;
    awsAccessKey?: string;
    cloudinaryKey?: string;
  };
  encryption: {
    jwtSecret?: string;
    encryptionKey?: string;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  sentryDsn?: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  errorReporting: boolean;
  performanceMonitoring: boolean;
  networkMonitoring: boolean;
  crashReporting: boolean;
  userTracking: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  providers: AnalyticsProvider[];
  trackingId?: string;
  customEvents: boolean;
  userProperties: boolean;
  screenTracking: boolean;
  crashTracking: boolean;
  performanceTracking: boolean;
}

export interface AnalyticsProvider {
  name: 'firebase' | 'amplitude' | 'mixpanel' | 'appsflyer' | 'custom';
  apiKey: string;
  enabled: boolean;
  events: string[];
}

export interface CrashReportingConfig {
  enabled: boolean;
  provider: 'sentry' | 'crashlytics' | 'bugsnag' | 'custom';
  apiKey?: string;
  release?: string;
  environment?: string;
  userId?: string;
  tags?: Record<string, string>;
  breadcrumbs: boolean;
  attachments: boolean;
  beforeSend?: (event: any) => any;
}

export interface PerformanceConfig {
  enabled: boolean;
  monitoring: boolean;
  tracing: boolean;
  profiling: boolean;
  memoryTracking: boolean;
  networkTracking: boolean;
  renderTracking: boolean;
  sampleRate: number;
  maxBreadcrumbs: number;
}

export interface BuildConfig {
  platform: 'ios' | 'android';
  buildType: 'debug' | 'release';
  bundleId: string;
  versionName: string;
  versionCode: number;
  minSdkVersion?: number;
  targetSdkVersion?: number;
  compileSdkVersion?: number;
  iosDeploymentTarget?: string;
  codeSignIdentity?: string;
  provisioningProfile?: string;
  keystorePath?: string;
  keystorePassword?: string;
  keyAlias?: string;
  keyPassword?: string;
}

export interface ReleaseConfig {
  version: string;
  buildNumber: string;
  releaseNotes: string;
  changelog: string[];
  rolloutPercentage: number;
  targetAudience: 'internal' | 'beta' | 'production';
  platforms: ('ios' | 'android')[];
  regions: string[];
  deviceTypes: string[];
  osVersions: {
    ios?: string[];
    android?: number[];
  };
}

export interface DeploymentPipeline {
  stages: DeploymentStage[];
  triggers: DeploymentTrigger[];
  notifications: NotificationConfig[];
  rollback: RollbackConfig;
}

export interface DeploymentStage {
  name: string;
  environment: Environment['name'];
  dependencies: string[];
  timeout: number;
  retries: number;
  healthChecks: HealthCheck[];
  rollbackTriggers: RollbackTrigger[];
  approvals: ApprovalConfig[];
}

export interface DeploymentTrigger {
  type: 'manual' | 'automatic' | 'scheduled' | 'webhook';
  condition?: string;
  schedule?: string;
  branch?: string;
  tag?: string;
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'teams' | 'webhook';
  recipients: string[];
  events: ('success' | 'failure' | 'started' | 'cancelled')[];
  template?: string;
}

export interface RollbackConfig {
  enabled: boolean;
  automatic: boolean;
  triggers: RollbackTrigger[];
  strategy: 'immediate' | 'gradual' | 'canary';
  timeout: number;
  healthChecks: HealthCheck[];
}

export interface RollbackTrigger {
  type: 'error_rate' | 'response_time' | 'crash_rate' | 'manual' | 'health_check';
  threshold?: number;
  window?: number;
  enabled: boolean;
}

export interface HealthCheck {
  name: string;
  type: 'http' | 'tcp' | 'custom';
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout: number;
  interval: number;
  retries: number;
  expectedStatus?: number;
  expectedResponse?: string;
  enabled: boolean;
}

export interface ApprovalConfig {
  required: boolean;
  approvers: string[];
  timeout: number;
  autoApprove: boolean;
  conditions: string[];
}

export interface DeploymentMetrics {
  deploymentId: string;
  version: string;
  environment: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'rolled_back';
  stages: StageMetrics[];
  healthChecks: HealthCheckResult[];
  errors: DeploymentError[];
  rollbackInfo?: RollbackInfo;
}

export interface StageMetrics {
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  logs: string[];
  artifacts: string[];
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  timestamp: Date;
  duration: number;
  message?: string;
  details?: any;
}

export interface DeploymentError {
  stage: string;
  timestamp: Date;
  error: string;
  stack?: string;
  context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RollbackInfo {
  reason: string;
  triggeredBy: string;
  timestamp: Date;
  previousVersion: string;
  strategy: string;
  duration: number;
  success: boolean;
}

export interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  enabled: boolean;
  startDate: Date;
  endDate?: Date;
  trafficAllocation: number;
  variants: ABTestVariant[];
  targetAudience: ABTestAudience;
  metrics: ABTestMetric[];
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  allocation: number;
  config: Record<string, any>;
  enabled: boolean;
}

export interface ABTestAudience {
  platform?: ('ios' | 'android')[];
  regions?: string[];
  userType?: ('new' | 'returning' | 'premium')[];
  ageRange?: [number, number];
  customAttributes?: Record<string, any>;
}

export interface ABTestMetric {
  name: string;
  type: 'conversion' | 'retention' | 'revenue' | 'engagement' | 'custom';
  description: string;
  goalType: 'increase' | 'decrease' | 'maintain';
  target?: number;
  significance: number;
}

export interface FeatureFlagConfig {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  variations: FeatureFlagVariation[];
  rules: FeatureFlagRule[];
  rollout: FeatureFlagRollout;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagVariation {
  id: string;
  name: string;
  value: boolean | string | number | object;
  description?: string;
}

export interface FeatureFlagRule {
  id: string;
  conditions: FeatureFlagCondition[];
  variationId: string;
  enabled: boolean;
}

export interface FeatureFlagCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface FeatureFlagRollout {
  type: 'percentage' | 'user_id' | 'attribute';
  percentage?: number;
  attribute?: string;
  buckets?: FeatureFlagBucket[];
}

export interface FeatureFlagBucket {
  variationId: string;
  weight: number;
}

export interface AppStoreConfig {
  ios: IOSStoreConfig;
  android: AndroidStoreConfig;
}

export interface IOSStoreConfig {
  bundleId: string;
  teamId: string;
  appId: string;
  appleId: string;
  appSpecificPassword: string;
  provisioningProfileType: 'development' | 'distribution' | 'adhoc' | 'enterprise';
  codeSignIdentity: string;
  exportMethod: 'app-store' | 'ad-hoc' | 'development' | 'enterprise';
  uploadToAppStore: boolean;
  submitForReview: boolean;
  releaseType: 'manual' | 'automatic';
  skipWaitingForProcessing: boolean;
}

export interface AndroidStoreConfig {
  packageName: string;
  track: 'internal' | 'alpha' | 'beta' | 'production';
  rolloutFraction?: number;
  status: 'draft' | 'inProgress' | 'halted' | 'completed';
  releaseNotes: LocalizedText[];
  uploadToPlayStore: boolean;
  submitForReview: boolean;
  inAppUpdatePriority: number;
}

export interface LocalizedText {
  language: string;
  text: string;
}

export interface CDNConfig {
  provider: 'cloudfront' | 'cloudflare' | 'fastly' | 'custom';
  distributionId?: string;
  cacheSettings: CacheSettings;
  geoRestrictions?: GeoRestriction[];
  ssl: SSLConfig;
  compressionSettings: CompressionSettings;
}

export interface CacheSettings {
  defaultTTL: number;
  maxTTL: number;
  cacheBehaviors: CacheBehavior[];
}

export interface CacheBehavior {
  pathPattern: string;
  ttl: number;
  compress: boolean;
  forwardCookies: 'none' | 'all' | 'whitelist';
  forwardHeaders: string[];
  queryStringForwarding: boolean;
}

export interface GeoRestriction {
  type: 'whitelist' | 'blacklist';
  locations: string[];
}

export interface SSLConfig {
  enabled: boolean;
  certificateId?: string;
  protocols: ('SSLv3' | 'TLSv1' | 'TLSv1_2016' | 'TLSv1.1_2016' | 'TLSv1.2_2018' | 'TLSv1.2_2019' | 'TLSv1.2_2021')[];
}

export interface CompressionSettings {
  enabled: boolean;
  types: string[];
  level: number;
}