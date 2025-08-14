export enum MetricPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum ViewSource {
  SEARCH = 'search',
  RECOMMENDATIONS = 'recommendations',
  DIRECT = 'direct',
  SUPER_LIKE = 'super_like',
  BOOST = 'boost',
}

export interface ProfileAnalytics {
  profileViews: number;
  viewsByPeriod: Array<{
    date: string;
    views: number;
  }>;
  viewSources: Record<ViewSource, number>;
  viewerDemographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Array<{
      city: string;
      count: number;
    }>;
  };
  peakViewingTimes: Array<{
    hour: number;
    dayOfWeek: number;
    views: number;
  }>;
  conversionRate: {
    viewsToLikes: number;
    likesToMatches: number;
    matchesToConversations: number;
  };
}

export interface MatchAnalytics {
  totalMatches: number;
  matchRate: number;
  matchQualityScore: number;
  averageConversationLength: number;
  responseRate: number;
  firstMessageSuccessRate: number;
  matchesByPeriod: Array<{
    date: string;
    matches: number;
  }>;
  matchGeography: Array<{
    location: string;
    latitude: number;
    longitude: number;
    count: number;
  }>;
  unmatchRate: number;
  averageMatchDuration: number;
}

export interface PhotoAnalytics {
  photos: Array<{
    id: string;
    uri: string;
    views: number;
    likes: number;
    engagementTime: number;
    position: number;
  }>;
  mostSuccessfulPhoto: string;
  totalPhotoViews: number;
  totalPhotoLikes: number;
  averageEngagementTime: number;
  abTestResults?: Array<{
    photoA: string;
    photoB: string;
    winnerPhoto: string;
    confidence: number;
  }>;
}

export interface SwipeAnalytics {
  rightSwipeRateReceived: number;
  leftSwipeRateReceived: number;
  yourRightSwipeRate: number;
  yourLeftSwipeRate: number;
  swipePatterns: {
    averageTimePerSwipe: number;
    fastestSwipeTime: number;
    slowestSwipeTime: number;
    peakSwipeTimes: Array<{
      hour: number;
      count: number;
    }>;
  };
  bestTimeToBeActive: {
    dayOfWeek: string;
    hourRange: string;
    matchProbability: number;
  };
  competitionAnalysis: {
    averageCompetitorScore: number;
    yourScore: number;
    percentile: number;
  };
  visibilityScore: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  newRegistrations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: number;
  };
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
    cohorts: Array<{
      cohort: string;
      users: number;
      retention: number;
    }>;
  };
  churnRate: number;
  geographicDistribution: Array<{
    country: string;
    region: string;
    users: number;
    percentage: number;
  }>;
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    orientations: Record<string, number>;
  };
}

export interface EngagementMetrics {
  averageSessionDuration: number;
  sessionsPerUser: number;
  swipesPerSession: number;
  messagesSent: number;
  messagesReceived: number;
  matchRate: number;
  superLikesUsage: {
    total: number;
    conversionRate: number;
  };
  featureAdoption: Record<string, number>;
  screenViews: Record<string, number>;
  bounceRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  conversionFunnel: {
    visitors: number;
    signups: number;
    trialStarts: number;
    paidConversions: number;
    retainedCustomers: number;
  };
  subscriptionMetrics: {
    totalSubscribers: number;
    newSubscribers: number;
    canceledSubscriptions: number;
    churnRate: number;
    reactivations: number;
  };
  paymentMetrics: {
    successRate: number;
    failureRate: number;
    averageTransactionValue: number;
    refundRate: number;
    chargebackRate: number;
  };
  revenueByPlan: Record<string, number>;
  revenueByPlatform: {
    ios: number;
    android: number;
    web: number;
  };
}

export interface PlatformHealth {
  appPerformance: {
    crashRate: number;
    crashFreeUsers: number;
    anrRate: number;
    startupTime: number;
    frameRate: number;
  };
  apiMetrics: {
    averageResponseTime: number;
    errorRate: number;
    requestsPerSecond: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  serverMetrics: {
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
  databaseMetrics: {
    queryPerformance: number;
    connectionPoolUsage: number;
    slowQueries: number;
    deadlocks: number;
  };
}

export interface RealTimeMetrics {
  activeUsersNow: number;
  currentSwipesPerMinute: number;
  matchesHappeningNow: number;
  messagesBeingSent: number;
  videoCallsActive: number;
  activeLocations: Array<{
    latitude: number;
    longitude: number;
    intensity: number;
  }>;
  systemAlerts: Array<{
    id: string;
    type: 'spike' | 'anomaly' | 'system' | 'fraud' | 'abuse';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

export interface MarketingAnalytics {
  campaignPerformance: {
    userAcquisitionCost: number;
    campaignROI: number;
    costPerClick: number;
    costPerInstall: number;
    conversionRate: number;
  };
  attribution: {
    organic: number;
    paid: number;
    referral: number;
    social: number;
    direct: number;
  };
  emailMetrics: {
    sentCount: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    bounceRate: number;
  };
  pushNotificationMetrics: {
    sentCount: number;
    deliveryRate: number;
    openRate: number;
    conversionRate: number;
    optOutRate: number;
  };
  growthMetrics: {
    viralCoefficient: number;
    referralProgramStats: {
      totalReferrals: number;
      successfulReferrals: number;
      rewardsClaimed: number;
    };
    socialSharing: {
      shares: number;
      clicksFromShares: number;
      conversionsFromShares: number;
    };
    marketPenetration: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
    withDots?: boolean;
  }>;
  legend?: string[];
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

export interface HeatmapData {
  data: Array<Array<number>>;
  xLabels: string[];
  yLabels: string[];
  colorScale: string[];
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  metrics: string[];
  filters: Record<string, any>;
  dateRange: {
    start: Date;
    end: Date;
  };
  granularity: MetricPeriod;
  chartType: 'line' | 'bar' | 'pie' | 'heatmap' | 'table';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdBy: string;
  createdAt: Date;
  lastRun?: Date;
  isFavorite: boolean;
  isShared: boolean;
  permissions: {
    view: string[];
    edit: string[];
  };
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  period: MetricPeriod;
  segments?: {
    age?: string[];
    gender?: string[];
    location?: string[];
    subscription?: string[];
  };
  comparison?: {
    enabled: boolean;
    previousPeriod: boolean;
    customPeriod?: {
      start: Date;
      end: Date;
    };
  };
}

export interface DataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
  metadata?: any;
}

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  platform: 'ios' | 'android';
  appVersion: string;
  deviceInfo: {
    model: string;
    os: string;
    screenSize: string;
  };
}