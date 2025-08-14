import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  FeatureFlagConfig, 
  ABTestConfig, 
  FeatureFlagVariation, 
  ABTestVariant 
} from '@/types/deployment';
import { currentEnvironment } from '@/config/environments';
import { monitoringService } from './monitoringService';

interface FeatureFlagCache {
  [key: string]: {
    value: any;
    timestamp: number;
    ttl: number;
  };
}

interface ABTestAssignment {
  testId: string;
  variantId: string;
  assignmentTime: Date;
  userId: string;
}

interface UserContext {
  userId?: string;
  userType?: 'new' | 'returning' | 'premium';
  platform: 'ios' | 'android';
  appVersion: string;
  country?: string;
  language?: string;
  customAttributes?: Record<string, any>;
}

class FeatureFlagService {
  private featureFlags: Map<string, FeatureFlagConfig> = new Map();
  private abTests: Map<string, ABTestConfig> = new Map();
  private cache: FeatureFlagCache = {};
  private userContext: UserContext;
  private abTestAssignments: Map<string, ABTestAssignment> = new Map();
  private isInitialized: boolean = false;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.userContext = {
      platform: currentEnvironment.name === 'ios' ? 'ios' : 'android',
      appVersion: currentEnvironment.version,
    };

    this.initialize();
  }

  // Initialization
  private async initialize(): Promise<void> {
    try {
      await this.loadCachedData();
      await this.fetchFeatureFlags();
      await this.fetchABTests();
      await this.loadABTestAssignments();

      this.setupRefreshInterval();
      this.isInitialized = true;

      console.log('Feature flag service initialized');
      monitoringService.addBreadcrumb('Feature flag service initialized', 'initialization');
    } catch (error) {
      console.error('Failed to initialize feature flag service:', error);
      monitoringService.reportError({
        error: error as Error,
        context: { component: 'FeatureFlagService', action: 'initialize' },
        severity: 'high',
      });
    }
  }

  private async loadCachedData(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem('feature_flag_cache');
      if (cachedData) {
        this.cache = JSON.parse(cachedData);
        console.log('Loaded cached feature flag data');
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }

  private async fetchFeatureFlags(): Promise<void> {
    try {
      // In a real implementation, this would fetch from a feature flag service
      const defaultFlags = this.getDefaultFeatureFlags();
      
      for (const flag of defaultFlags) {
        this.featureFlags.set(flag.key, flag);
      }

      console.log(`Loaded ${this.featureFlags.size} feature flags`);
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
    }
  }

  private async fetchABTests(): Promise<void> {
    try {
      // In a real implementation, this would fetch active A/B tests
      const defaultTests = this.getDefaultABTests();
      
      for (const test of defaultTests) {
        this.abTests.set(test.testId, test);
      }

      console.log(`Loaded ${this.abTests.size} A/B tests`);
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error);
    }
  }

  private async loadABTestAssignments(): Promise<void> {
    try {
      const assignments = await AsyncStorage.getItem('ab_test_assignments');
      if (assignments) {
        const parsed = JSON.parse(assignments);
        this.abTestAssignments = new Map(Object.entries(parsed));
        console.log(`Loaded ${this.abTestAssignments.size} A/B test assignments`);
      }
    } catch (error) {
      console.error('Failed to load A/B test assignments:', error);
    }
  }

  private setupRefreshInterval(): void {
    // Refresh feature flags every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, 5 * 60 * 1000);
  }

  private getDefaultFeatureFlags(): FeatureFlagConfig[] {
    return [
      {
        key: 'enable_video_chat',
        name: 'Video Chat',
        description: 'Enable video calling feature',
        enabled: true,
        defaultValue: false,
        variations: [
          { id: 'on', name: 'Enabled', value: true },
          { id: 'off', name: 'Disabled', value: false },
        ],
        rules: [],
        rollout: {
          type: 'percentage',
          percentage: currentEnvironment.name === 'production' ? 25 : 100,
        },
        tags: ['video', 'premium'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'enable_ai_matching',
        name: 'AI Matching',
        description: 'Enable AI-powered matching algorithm',
        enabled: true,
        defaultValue: false,
        variations: [
          { id: 'on', name: 'Enabled', value: true },
          { id: 'off', name: 'Disabled', value: false },
        ],
        rules: [],
        rollout: {
          type: 'percentage',
          percentage: currentEnvironment.name === 'production' ? 10 : 100,
        },
        tags: ['ai', 'matching'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'new_profile_design',
        name: 'New Profile Design',
        description: 'Use new profile card design',
        enabled: true,
        defaultValue: false,
        variations: [
          { id: 'new', name: 'New Design', value: true },
          { id: 'old', name: 'Old Design', value: false },
        ],
        rules: [],
        rollout: {
          type: 'percentage',
          percentage: 50,
        },
        tags: ['ui', 'profile'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getDefaultABTests(): ABTestConfig[] {
    return [
      {
        testId: 'onboarding_flow_test',
        name: 'Onboarding Flow Test',
        description: 'Test different onboarding flows',
        enabled: true,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        trafficAllocation: 50,
        variants: [
          {
            id: 'control',
            name: 'Original Flow',
            description: 'Current onboarding flow',
            allocation: 50,
            config: { flow_type: 'original' },
            enabled: true,
          },
          {
            id: 'simplified',
            name: 'Simplified Flow',
            description: 'Simplified onboarding with fewer steps',
            allocation: 50,
            config: { flow_type: 'simplified' },
            enabled: true,
          },
        ],
        targetAudience: {
          userType: ['new'],
        },
        metrics: [
          {
            name: 'completion_rate',
            type: 'conversion',
            description: 'Onboarding completion rate',
            goalType: 'increase',
            target: 80,
            significance: 0.05,
          },
        ],
        status: 'running',
      },
      {
        testId: 'swipe_button_test',
        name: 'Swipe Button Test',
        description: 'Test different swipe button designs',
        enabled: true,
        startDate: new Date(),
        trafficAllocation: 30,
        variants: [
          {
            id: 'control',
            name: 'Current Buttons',
            description: 'Current swipe button design',
            allocation: 50,
            config: { button_style: 'current' },
            enabled: true,
          },
          {
            id: 'larger_buttons',
            name: 'Larger Buttons',
            description: 'Larger, more prominent buttons',
            allocation: 50,
            config: { button_style: 'large' },
            enabled: true,
          },
        ],
        targetAudience: {},
        metrics: [
          {
            name: 'engagement_rate',
            type: 'engagement',
            description: 'User engagement with swipe actions',
            goalType: 'increase',
            significance: 0.05,
          },
        ],
        status: 'running',
      },
    ];
  }

  // User Context Management
  public setUserContext(context: Partial<UserContext>): void {
    this.userContext = { ...this.userContext, ...context };
    
    // Clear cache when user context changes significantly
    if (context.userId || context.userType) {
      this.clearCache();
    }

    monitoringService.addBreadcrumb('User context updated', 'feature_flags');
    console.log('User context updated:', this.userContext);
  }

  // Feature Flag Evaluation
  public isFeatureEnabled(flagKey: string): boolean {
    try {
      const cachedValue = this.getCachedValue(flagKey);
      if (cachedValue !== null) {
        return Boolean(cachedValue);
      }

      const flag = this.featureFlags.get(flagKey);
      if (!flag || !flag.enabled) {
        return Boolean(flag?.defaultValue || false);
      }

      const value = this.evaluateFeatureFlag(flag);
      this.setCachedValue(flagKey, value, 300000); // Cache for 5 minutes

      // Track feature flag evaluation
      monitoringService.trackEvent({
        eventName: 'feature_flag_evaluated',
        parameters: {
          flag_key: flagKey,
          value: value,
          user_id: this.userContext.userId,
        },
      });

      return Boolean(value);
    } catch (error) {
      console.error(`Failed to evaluate feature flag ${flagKey}:`, error);
      monitoringService.reportError({
        error: error as Error,
        context: { flagKey, component: 'FeatureFlagService' },
        severity: 'medium',
      });
      
      const flag = this.featureFlags.get(flagKey);
      return Boolean(flag?.defaultValue || false);
    }
  }

  public getFeatureValue<T = any>(flagKey: string, defaultValue?: T): T {
    try {
      const cachedValue = this.getCachedValue(flagKey);
      if (cachedValue !== null) {
        return cachedValue as T;
      }

      const flag = this.featureFlags.get(flagKey);
      if (!flag || !flag.enabled) {
        return (defaultValue ?? flag?.defaultValue) as T;
      }

      const value = this.evaluateFeatureFlag(flag);
      this.setCachedValue(flagKey, value, 300000);

      return value as T;
    } catch (error) {
      console.error(`Failed to get feature value ${flagKey}:`, error);
      return defaultValue as T;
    }
  }

  private evaluateFeatureFlag(flag: FeatureFlagConfig): any {
    // Evaluate rules first
    for (const rule of flag.rules) {
      if (!rule.enabled) continue;

      if (this.evaluateRuleConditions(rule.conditions)) {
        const variation = flag.variations.find(v => v.id === rule.variationId);
        return variation?.value ?? flag.defaultValue;
      }
    }

    // Evaluate rollout strategy
    return this.evaluateRollout(flag);
  }

  private evaluateRuleConditions(conditions: any[]): boolean {
    return conditions.every(condition => this.evaluateCondition(condition));
  }

  private evaluateCondition(condition: any): boolean {
    const contextValue = this.getContextValue(condition.attribute);
    
    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'not_equals':
        return contextValue !== condition.value;
      case 'contains':
        return String(contextValue).includes(String(condition.value));
      case 'not_contains':
        return !String(contextValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      case 'greater_than':
        return Number(contextValue) > Number(condition.value);
      case 'less_than':
        return Number(contextValue) < Number(condition.value);
      default:
        return false;
    }
  }

  private getContextValue(attribute: string): any {
    switch (attribute) {
      case 'user_id':
        return this.userContext.userId;
      case 'user_type':
        return this.userContext.userType;
      case 'platform':
        return this.userContext.platform;
      case 'app_version':
        return this.userContext.appVersion;
      case 'country':
        return this.userContext.country;
      case 'language':
        return this.userContext.language;
      default:
        return this.userContext.customAttributes?.[attribute];
    }
  }

  private evaluateRollout(flag: FeatureFlagConfig): any {
    if (flag.rollout.type === 'percentage') {
      const hash = this.hashString(`${this.userContext.userId || 'anonymous'}:${flag.key}`);
      const percentage = (hash % 100) / 100;
      const enabled = percentage < (flag.rollout.percentage || 0) / 100;
      
      const targetVariation = flag.variations.find(v => v.value === enabled);
      return targetVariation?.value ?? flag.defaultValue;
    }

    // Default to first variation or default value
    return flag.variations[0]?.value ?? flag.defaultValue;
  }

  // A/B Testing
  public getABTestVariant(testId: string): string | null {
    try {
      // Check for existing assignment
      const existingAssignment = this.abTestAssignments.get(testId);
      if (existingAssignment && existingAssignment.userId === this.userContext.userId) {
        return existingAssignment.variantId;
      }

      const test = this.abTests.get(testId);
      if (!test || !test.enabled || test.status !== 'running') {
        return null;
      }

      // Check if test is still active
      const now = new Date();
      if (test.endDate && now > test.endDate) {
        return null;
      }

      // Check if user is in target audience
      if (!this.isUserInTargetAudience(test.targetAudience)) {
        return null;
      }

      // Check traffic allocation
      const trafficHash = this.hashString(`${this.userContext.userId || 'anonymous'}:${testId}`);
      const trafficPercentage = (trafficHash % 100) / 100;
      if (trafficPercentage > test.trafficAllocation / 100) {
        return null;
      }

      // Assign variant
      const variantId = this.assignVariant(test);
      if (variantId && this.userContext.userId) {
        const assignment: ABTestAssignment = {
          testId,
          variantId,
          assignmentTime: new Date(),
          userId: this.userContext.userId,
        };
        
        this.abTestAssignments.set(testId, assignment);
        this.saveABTestAssignments();

        // Track assignment
        monitoringService.trackEvent({
          eventName: 'ab_test_assigned',
          parameters: {
            test_id: testId,
            variant_id: variantId,
            user_id: this.userContext.userId,
          },
        });
      }

      return variantId;
    } catch (error) {
      console.error(`Failed to get A/B test variant for ${testId}:`, error);
      return null;
    }
  }

  private isUserInTargetAudience(audience: any): boolean {
    if (audience.platform && !audience.platform.includes(this.userContext.platform)) {
      return false;
    }

    if (audience.userType && this.userContext.userType && 
        !audience.userType.includes(this.userContext.userType)) {
      return false;
    }

    if (audience.regions && this.userContext.country && 
        !audience.regions.includes(this.userContext.country)) {
      return false;
    }

    if (audience.customAttributes) {
      for (const [key, value] of Object.entries(audience.customAttributes)) {
        const userValue = this.userContext.customAttributes?.[key];
        if (userValue !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private assignVariant(test: ABTestConfig): string | null {
    const hash = this.hashString(`${this.userContext.userId || 'anonymous'}:${test.testId}:variant`);
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

  // Cache Management
  private getCachedValue(key: string): any {
    const cached = this.cache[key];
    if (!cached) return null;

    if (Date.now() > cached.timestamp + cached.ttl) {
      delete this.cache[key];
      return null;
    }

    return cached.value;
  }

  private setCachedValue(key: string, value: any, ttl: number): void {
    this.cache[key] = {
      value,
      timestamp: Date.now(),
      ttl,
    };

    // Save to AsyncStorage
    AsyncStorage.setItem('feature_flag_cache', JSON.stringify(this.cache)).catch(error => {
      console.error('Failed to save cache:', error);
    });
  }

  private clearCache(): void {
    this.cache = {};
    AsyncStorage.removeItem('feature_flag_cache').catch(error => {
      console.error('Failed to clear cache:', error);
    });
  }

  private async saveABTestAssignments(): Promise<void> {
    try {
      const assignments = Object.fromEntries(this.abTestAssignments.entries());
      await AsyncStorage.setItem('ab_test_assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save A/B test assignments:', error);
    }
  }

  // Utility Methods
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Refresh and Sync
  public async refresh(): Promise<void> {
    try {
      await this.fetchFeatureFlags();
      await this.fetchABTests();
      this.clearCache(); // Clear cache to force re-evaluation
      
      console.log('Feature flags refreshed');
      monitoringService.addBreadcrumb('Feature flags refreshed', 'sync');
    } catch (error) {
      console.error('Failed to refresh feature flags:', error);
    }
  }

  // Debug and Monitoring
  public getDebugInfo(): any {
    return {
      initialized: this.isInitialized,
      featureFlagsCount: this.featureFlags.size,
      abTestsCount: this.abTests.size,
      cacheSize: Object.keys(this.cache).length,
      assignmentsCount: this.abTestAssignments.size,
      userContext: this.userContext,
    };
  }

  public getAllFeatureFlags(): Map<string, boolean> {
    const result = new Map<string, boolean>();
    
    for (const [key] of this.featureFlags) {
      result.set(key, this.isFeatureEnabled(key));
    }

    return result;
  }

  public getAllABTestVariants(): Map<string, string | null> {
    const result = new Map<string, string | null>();
    
    for (const [testId] of this.abTests) {
      result.set(testId, this.getABTestVariant(testId));
    }

    return result;
  }

  // Cleanup
  public cleanup(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    
    this.saveABTestAssignments();
    console.log('Feature flag service cleaned up');
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();

// Convenience functions
export const isFeatureEnabled = (flagKey: string): boolean => {
  return featureFlagService.isFeatureEnabled(flagKey);
};

export const getFeatureValue = <T = any>(flagKey: string, defaultValue?: T): T => {
  return featureFlagService.getFeatureValue(flagKey, defaultValue);
};

export const getABTestVariant = (testId: string): string | null => {
  return featureFlagService.getABTestVariant(testId);
};

export const setUserContext = (context: Partial<UserContext>): void => {
  featureFlagService.setUserContext(context);
};

export default FeatureFlagService;