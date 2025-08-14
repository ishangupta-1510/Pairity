import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ProfileAnalytics,
  MatchAnalytics,
  PhotoAnalytics,
  SwipeAnalytics,
  UserMetrics,
  EngagementMetrics,
  RevenueMetrics,
  PlatformHealth,
  RealTimeMetrics,
  MarketingAnalytics,
  MetricPeriod,
  AnalyticsEvent,
  AnalyticsFilter,
  CustomReport,
} from '@/types/analytics';

class AnalyticsService {
  private wsConnection: WebSocket | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline: boolean = true;

  /**
   * Track analytics event
   */
  async trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    const event: AnalyticsEvent = {
      eventName,
      userId: await this.getUserId(),
      sessionId: await this.getSessionId(),
      timestamp: new Date(),
      properties,
      platform: this.getPlatform(),
      appVersion: '1.0.0',
      deviceInfo: await this.getDeviceInfo(),
    };

    if (this.isOnline) {
      await this.sendEvent(event);
    } else {
      this.eventQueue.push(event);
      await this.saveEventQueue();
    }
  }

  /**
   * Get user profile analytics
   */
  async getUserAnalytics(filter: AnalyticsFilter): Promise<ProfileAnalytics> {
    try {
      // In production, this would make an API call
      const mockData: ProfileAnalytics = {
        profileViews: Math.floor(Math.random() * 500) + 100,
        viewsByPeriod: this.generatePeriodData(filter.period),
        viewSources: {
          search: 45,
          recommendations: 30,
          direct: 15,
          super_like: 7,
          boost: 3,
        },
        viewerDemographics: {
          ageGroups: {
            '18-24': 25,
            '25-34': 45,
            '35-44': 20,
            '45+': 10,
          },
          genders: {
            Female: 60,
            Male: 35,
            Other: 5,
          },
          locations: [
            { city: 'New York', count: 45 },
            { city: 'Los Angeles', count: 32 },
            { city: 'Chicago', count: 28 },
          ],
        },
        peakViewingTimes: this.generatePeakTimes(),
        conversionRate: {
          viewsToLikes: Math.random() * 0.3,
          likesToMatches: Math.random() * 0.5,
          matchesToConversations: Math.random() * 0.8,
        },
      };

      // Cache the data
      await this.cacheData('profile_analytics', mockData);
      return mockData;
    } catch (error) {
      // Try to return cached data on error
      const cached = await this.getCachedData('profile_analytics');
      if (cached) return cached;
      throw error;
    }
  }

  /**
   * Get match analytics
   */
  async getMatchAnalytics(filter: AnalyticsFilter): Promise<MatchAnalytics> {
    try {
      const mockData: MatchAnalytics = {
        totalMatches: Math.floor(Math.random() * 100) + 20,
        matchRate: Math.random() * 0.4,
        matchQualityScore: Math.floor(Math.random() * 30) + 70,
        averageConversationLength: Math.floor(Math.random() * 50) + 10,
        responseRate: Math.random() * 0.4 + 0.6,
        firstMessageSuccessRate: Math.random() * 0.3 + 0.5,
        matchesByPeriod: this.generatePeriodData(filter.period),
        matchGeography: [
          { location: 'New York', latitude: 40.7128, longitude: -74.0060, count: 15 },
          { location: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, count: 12 },
        ],
        unmatchRate: Math.random() * 0.2,
        averageMatchDuration: Math.floor(Math.random() * 30) + 7,
      };

      await this.cacheData('match_analytics', mockData);
      return mockData;
    } catch (error) {
      const cached = await this.getCachedData('match_analytics');
      if (cached) return cached;
      throw error;
    }
  }

  /**
   * Get admin user metrics
   */
  async getUserMetrics(filter: AnalyticsFilter): Promise<UserMetrics> {
    try {
      const mockData: UserMetrics = {
        totalUsers: 125000,
        activeUsers: {
          daily: 35000,
          weekly: 75000,
          monthly: 95000,
        },
        newRegistrations: {
          today: 450,
          thisWeek: 2800,
          thisMonth: 12000,
          trend: 0.15,
        },
        userRetention: {
          day1: 0.85,
          day7: 0.65,
          day30: 0.45,
          cohorts: this.generateCohortData(),
        },
        churnRate: 0.08,
        geographicDistribution: [
          { country: 'USA', region: 'North America', users: 45000, percentage: 36 },
          { country: 'UK', region: 'Europe', users: 25000, percentage: 20 },
          { country: 'Canada', region: 'North America', users: 15000, percentage: 12 },
        ],
        demographics: {
          ageGroups: {
            '18-24': 30,
            '25-34': 45,
            '35-44': 20,
            '45+': 5,
          },
          genders: {
            Female: 48,
            Male: 50,
            Other: 2,
          },
          orientations: {
            Straight: 75,
            Gay: 10,
            Lesbian: 8,
            Bisexual: 5,
            Other: 2,
          },
        },
      };

      await this.cacheData('user_metrics', mockData);
      return mockData;
    } catch (error) {
      const cached = await this.getCachedData('user_metrics');
      if (cached) return cached;
      throw error;
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    return {
      activeUsersNow: Math.floor(Math.random() * 5000) + 1000,
      currentSwipesPerMinute: Math.floor(Math.random() * 500) + 100,
      matchesHappeningNow: Math.floor(Math.random() * 50) + 10,
      messagesBeingSent: Math.floor(Math.random() * 200) + 50,
      videoCallsActive: Math.floor(Math.random() * 100) + 20,
      activeLocations: this.generateActiveLocations(),
      systemAlerts: [],
    };
  }

  /**
   * Connect to real-time updates
   */
  connectToRealTime(onUpdate: (metrics: RealTimeMetrics) => void): () => void {
    // Simulate WebSocket connection
    const interval = setInterval(async () => {
      const metrics = await this.getRealTimeMetrics();
      onUpdate(metrics);
    }, 5000);

    return () => clearInterval(interval);
  }

  /**
   * Create custom report
   */
  async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'lastRun'>): Promise<CustomReport> {
    const newReport: CustomReport = {
      ...report,
      id: `report_${Date.now()}`,
      createdAt: new Date(),
      lastRun: new Date(),
    };

    const reports = await this.getCustomReports();
    reports.push(newReport);
    await AsyncStorage.setItem('custom_reports', JSON.stringify(reports));

    return newReport;
  }

  /**
   * Get custom reports
   */
  async getCustomReports(): Promise<CustomReport[]> {
    try {
      const stored = await AsyncStorage.getItem('custom_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    type: 'profile' | 'match' | 'revenue' | 'engagement',
    format: 'csv' | 'pdf',
    filter: AnalyticsFilter
  ): Promise<string> {
    // Generate export URL
    const exportData = {
      type,
      format,
      filter,
      timestamp: new Date().toISOString(),
    };

    // In production, this would generate actual export
    return `data:text/${format};base64,${btoa(JSON.stringify(exportData))}`;
  }

  // Helper methods

  private async getUserId(): Promise<string> {
    const stored = await AsyncStorage.getItem('user_id');
    return stored || 'anonymous';
  }

  private async getSessionId(): Promise<string> {
    let sessionId = await AsyncStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private getPlatform(): 'ios' | 'android' {
    // In production, use Platform.OS
    return 'ios';
  }

  private async getDeviceInfo() {
    return {
      model: 'iPhone 13',
      os: 'iOS 15.0',
      screenSize: '6.1"',
    };
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    // In production, send to analytics backend
    console.log('Analytics event:', event);
  }

  private async saveEventQueue(): Promise<void> {
    await AsyncStorage.setItem('analytics_queue', JSON.stringify(this.eventQueue));
  }

  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    for (const event of this.eventQueue) {
      await this.sendEvent(event);
    }

    this.eventQueue = [];
    await AsyncStorage.removeItem('analytics_queue');
  }

  private async cacheData(key: string, data: any): Promise<void> {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(`analytics_cache_${key}`, JSON.stringify(cacheEntry));
  }

  private async getCachedData(key: string): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem(`analytics_cache_${key}`);
      if (!stored) return null;

      const cacheEntry = JSON.parse(stored);
      const cacheAge = Date.now() - cacheEntry.timestamp;
      
      // Cache valid for 5 minutes
      if (cacheAge < 5 * 60 * 1000) {
        return cacheEntry.data;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  private generatePeriodData(period: MetricPeriod): Array<{ date: string; [key: string]: any }> {
    const days = period === MetricPeriod.DAILY ? 24 : period === MetricPeriod.WEEKLY ? 7 : 30;
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const label = period === MetricPeriod.DAILY 
        ? `${i}:00`
        : period === MetricPeriod.WEEKLY 
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
          : `Day ${i + 1}`;
      
      data.push({
        date: label,
        views: Math.floor(Math.random() * 100) + 20,
        matches: Math.floor(Math.random() * 20) + 2,
      });
    }
    
    return data;
  }

  private generatePeakTimes(): Array<{ hour: number; dayOfWeek: number; views: number }> {
    const times = [];
    for (let hour = 0; hour < 24; hour += 4) {
      for (let day = 0; day < 7; day++) {
        times.push({
          hour,
          dayOfWeek: day,
          views: Math.floor(Math.random() * 50) + 10,
        });
      }
    }
    return times;
  }

  private generateCohortData() {
    const cohorts = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (const month of months) {
      cohorts.push({
        cohort: `${month} 2024`,
        users: Math.floor(Math.random() * 5000) + 1000,
        retention: Math.random() * 0.5 + 0.3,
      });
    }
    
    return cohorts;
  }

  private generateActiveLocations() {
    const locations = [];
    const cities = [
      { lat: 40.7128, lng: -74.0060 }, // NYC
      { lat: 34.0522, lng: -118.2437 }, // LA
      { lat: 41.8781, lng: -87.6298 }, // Chicago
      { lat: 29.7604, lng: -95.3698 }, // Houston
      { lat: 33.4484, lng: -112.0740 }, // Phoenix
    ];

    for (const city of cities) {
      locations.push({
        latitude: city.lat + (Math.random() - 0.5) * 0.1,
        longitude: city.lng + (Math.random() - 0.5) * 0.1,
        intensity: Math.random(),
      });
    }

    return locations;
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      this.flushEventQueue();
    }
  }
}

export const analyticsService = new AnalyticsService();