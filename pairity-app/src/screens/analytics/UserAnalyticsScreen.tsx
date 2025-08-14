import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
} from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

import {
  ProfileAnalytics,
  MatchAnalytics,
  PhotoAnalytics,
  SwipeAnalytics,
  MetricPeriod,
  ViewSource,
} from '@/types/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

const UserAnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'matches' | 'photos' | 'swipes'>('profile');
  const [period, setPeriod] = useState<MetricPeriod>(MetricPeriod.WEEKLY);
  const [isLoading, setIsLoading] = useState(true);
  
  const [profileAnalytics, setProfileAnalytics] = useState<ProfileAnalytics | null>(null);
  const [matchAnalytics, setMatchAnalytics] = useState<MatchAnalytics | null>(null);
  const [photoAnalytics, setPhotoAnalytics] = useState<PhotoAnalytics | null>(null);
  const [swipeAnalytics, setSwipeAnalytics] = useState<SwipeAnalytics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data
    setProfileAnalytics({
      profileViews: 234,
      viewsByPeriod: [
        { date: 'Mon', views: 32 },
        { date: 'Tue', views: 45 },
        { date: 'Wed', views: 28 },
        { date: 'Thu', views: 52 },
        { date: 'Fri', views: 38 },
        { date: 'Sat', views: 42 },
        { date: 'Sun', views: 35 },
      ],
      viewSources: {
        [ViewSource.SEARCH]: 45,
        [ViewSource.RECOMMENDATIONS]: 30,
        [ViewSource.DIRECT]: 15,
        [ViewSource.SUPER_LIKE]: 7,
        [ViewSource.BOOST]: 3,
      },
      viewerDemographics: {
        ageGroups: {
          '18-24': 25,
          '25-34': 45,
          '35-44': 20,
          '45+': 10,
        },
        genders: {
          'Female': 60,
          'Male': 35,
          'Other': 5,
        },
        locations: [
          { city: 'New York', count: 45 },
          { city: 'Los Angeles', count: 32 },
          { city: 'Chicago', count: 28 },
        ],
      },
      peakViewingTimes: [
        { hour: 8, dayOfWeek: 1, views: 12 },
        { hour: 12, dayOfWeek: 1, views: 18 },
        { hour: 20, dayOfWeek: 1, views: 25 },
      ],
      conversionRate: {
        viewsToLikes: 0.15,
        likesToMatches: 0.35,
        matchesToConversations: 0.72,
      },
    });

    setMatchAnalytics({
      totalMatches: 47,
      matchRate: 0.23,
      matchQualityScore: 78,
      averageConversationLength: 24,
      responseRate: 0.82,
      firstMessageSuccessRate: 0.65,
      matchesByPeriod: [
        { date: 'Mon', matches: 5 },
        { date: 'Tue', matches: 8 },
        { date: 'Wed', matches: 3 },
        { date: 'Thu', matches: 7 },
        { date: 'Fri', matches: 9 },
        { date: 'Sat', matches: 12 },
        { date: 'Sun', matches: 8 },
      ],
      matchGeography: [
        { location: 'New York', latitude: 40.7128, longitude: -74.0060, count: 15 },
        { location: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, count: 12 },
      ],
      unmatchRate: 0.08,
      averageMatchDuration: 14,
    });

    setPhotoAnalytics({
      photos: [
        { id: '1', uri: '', views: 180, likes: 45, engagementTime: 3.2, position: 1 },
        { id: '2', uri: '', views: 150, likes: 38, engagementTime: 2.8, position: 2 },
        { id: '3', uri: '', views: 120, likes: 28, engagementTime: 2.1, position: 3 },
        { id: '4', uri: '', views: 90, likes: 18, engagementTime: 1.5, position: 4 },
      ],
      mostSuccessfulPhoto: '1',
      totalPhotoViews: 540,
      totalPhotoLikes: 129,
      averageEngagementTime: 2.4,
    });

    setSwipeAnalytics({
      rightSwipeRateReceived: 0.28,
      leftSwipeRateReceived: 0.72,
      yourRightSwipeRate: 0.35,
      yourLeftSwipeRate: 0.65,
      swipePatterns: {
        averageTimePerSwipe: 2.5,
        fastestSwipeTime: 0.3,
        slowestSwipeTime: 15.2,
        peakSwipeTimes: [
          { hour: 20, count: 45 },
          { hour: 21, count: 52 },
          { hour: 22, count: 38 },
        ],
      },
      bestTimeToBeActive: {
        dayOfWeek: 'Friday',
        hourRange: '8-10 PM',
        matchProbability: 0.42,
      },
      competitionAnalysis: {
        averageCompetitorScore: 65,
        yourScore: 72,
        percentile: 68,
      },
      visibilityScore: 75,
    });

    setIsLoading(false);
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  const renderProfileAnalytics = () => {
    if (!profileAnalytics) return null;

    const viewSourceData = Object.entries(profileAnalytics.viewSources).map(([source, value]) => ({
      name: source.replace('_', ' '),
      population: value,
      color: getColorForSource(source as ViewSource),
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Profile Views Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Profile Views
            </Text>
            <Text style={[styles.bigNumber, { color: theme.colors.primary }]}>
              {profileAnalytics.profileViews}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Last 7 days
            </Text>
          </View>
          
          <LineChart
            data={{
              labels: profileAnalytics.viewsByPeriod.map(d => d.date),
              datasets: [{
                data: profileAnalytics.viewsByPeriod.map(d => d.views),
              }],
            }}
            width={CHART_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* View Sources */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            View Sources
          </Text>
          <PieChart
            data={viewSourceData}
            width={CHART_WIDTH - 32}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Conversion Rates */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Conversion Rates
          </Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                {(profileAnalytics.conversionRate.viewsToLikes * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Views to Likes
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.accent }]}>
                {(profileAnalytics.conversionRate.likesToMatches * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Likes to Matches
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.success }]}>
                {(profileAnalytics.conversionRate.matchesToConversations * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Match to Chat
              </Text>
            </View>
          </View>
        </View>

        {/* Demographics */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Viewer Demographics
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Age Groups
          </Text>
          <BarChart
            data={{
              labels: Object.keys(profileAnalytics.viewerDemographics.ageGroups),
              datasets: [{
                data: Object.values(profileAnalytics.viewerDemographics.ageGroups),
              }],
            }}
            width={CHART_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisSuffix="%"
          />
        </View>
      </ScrollView>
    );
  };

  const renderMatchAnalytics = () => {
    if (!matchAnalytics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Match Overview */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Total Matches
            </Text>
            <Text style={[styles.bigNumber, { color: theme.colors.primary }]}>
              {matchAnalytics.totalMatches}
            </Text>
            <View style={styles.row}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                  {(matchAnalytics.matchRate * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Match Rate
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                  {matchAnalytics.matchQualityScore}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Quality Score
                </Text>
              </View>
            </View>
          </View>

          <LineChart
            data={{
              labels: matchAnalytics.matchesByPeriod.map(d => d.date),
              datasets: [{
                data: matchAnalytics.matchesByPeriod.map(d => d.matches),
              }],
            }}
            width={CHART_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Conversation Metrics */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Conversation Metrics
          </Text>
          
          <View style={styles.progressMetrics}>
            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                Response Rate
              </Text>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  style={[styles.progressFill, { width: `${matchAnalytics.responseRate * 100}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                {(matchAnalytics.responseRate * 100).toFixed(0)}%
              </Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                First Message Success
              </Text>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[theme.colors.accent, theme.colors.success]}
                  style={[styles.progressFill, { width: `${matchAnalytics.firstMessageSuccessRate * 100}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={[styles.progressValue, { color: theme.colors.accent }]}>
                {(matchAnalytics.firstMessageSuccessRate * 100).toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                {matchAnalytics.averageConversationLength}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Avg Messages
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.accent }]}>
                {matchAnalytics.averageMatchDuration}d
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Avg Duration
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.error }]}>
                {(matchAnalytics.unmatchRate * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Unmatch Rate
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderPhotoAnalytics = () => {
    if (!photoAnalytics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Photo Performance */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Photo Performance
          </Text>
          
          <View style={styles.photoMetrics}>
            <View style={styles.totalMetric}>
              <Icon name="visibility" size={24} color={theme.colors.primary} />
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                {photoAnalytics.totalPhotoViews}
              </Text>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
                Total Views
              </Text>
            </View>
            
            <View style={styles.totalMetric}>
              <Icon name="favorite" size={24} color={theme.colors.accent} />
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                {photoAnalytics.totalPhotoLikes}
              </Text>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
                Total Likes
              </Text>
            </View>
            
            <View style={styles.totalMetric}>
              <Icon name="timer" size={24} color={theme.colors.success} />
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                {photoAnalytics.averageEngagementTime.toFixed(1)}s
              </Text>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
                Avg Time
              </Text>
            </View>
          </View>

          <BarChart
            data={{
              labels: photoAnalytics.photos.map(p => `Photo ${p.position}`),
              datasets: [
                {
                  data: photoAnalytics.photos.map(p => p.views),
                },
              ],
            }}
            width={CHART_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=" views"
          />
        </View>

        {/* Individual Photo Stats */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Individual Photo Stats
          </Text>
          
          {photoAnalytics.photos.map((photo) => (
            <View key={photo.id} style={styles.photoStatItem}>
              <View style={styles.photoPosition}>
                <Text style={[styles.photoPositionText, { color: theme.colors.text }]}>
                  #{photo.position}
                </Text>
                {photo.id === photoAnalytics.mostSuccessfulPhoto && (
                  <Icon name="star" size={16} color={theme.colors.premium} />
                )}
              </View>
              
              <View style={styles.photoStats}>
                <View style={styles.photoStatRow}>
                  <Icon name="visibility" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.photoStatText, { color: theme.colors.text }]}>
                    {photo.views} views
                  </Text>
                </View>
                <View style={styles.photoStatRow}>
                  <Icon name="favorite" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.photoStatText, { color: theme.colors.text }]}>
                    {photo.likes} likes
                  </Text>
                </View>
                <View style={styles.photoStatRow}>
                  <Icon name="timer" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.photoStatText, { color: theme.colors.text }]}>
                    {photo.engagementTime.toFixed(1)}s avg
                  </Text>
                </View>
              </View>
              
              <View style={styles.photoPerformance}>
                <Text style={[styles.likeRate, { color: theme.colors.primary }]}>
                  {((photo.likes / photo.views) * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.likeRateLabel, { color: theme.colors.textSecondary }]}>
                  Like Rate
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderSwipeAnalytics = () => {
    if (!swipeAnalytics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Swipe Rates */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Swipe Analytics
          </Text>
          
          <View style={styles.swipeRates}>
            <View style={styles.swipeRateItem}>
              <Text style={[styles.swipeRateTitle, { color: theme.colors.text }]}>
                How Others Swipe You
              </Text>
              <View style={styles.swipeBarContainer}>
                <View style={styles.swipeBar}>
                  <LinearGradient
                    colors={[theme.colors.success, theme.colors.primary]}
                    style={[styles.swipeBarFill, { width: `${swipeAnalytics.rightSwipeRateReceived * 100}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={[styles.swipePercentage, { color: theme.colors.success }]}>
                  {(swipeAnalytics.rightSwipeRateReceived * 100).toFixed(0)}% Right
                </Text>
              </View>
            </View>

            <View style={styles.swipeRateItem}>
              <Text style={[styles.swipeRateTitle, { color: theme.colors.text }]}>
                Your Swipe Pattern
              </Text>
              <View style={styles.swipeBarContainer}>
                <View style={styles.swipeBar}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.accent]}
                    style={[styles.swipeBarFill, { width: `${swipeAnalytics.yourRightSwipeRate * 100}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={[styles.swipePercentage, { color: theme.colors.primary }]}>
                  {(swipeAnalytics.yourRightSwipeRate * 100).toFixed(0)}% Right
                </Text>
              </View>
            </View>
          </View>

          {/* Visibility Score */}
          <View style={styles.visibilityScore}>
            <Text style={[styles.visibilityTitle, { color: theme.colors.text }]}>
              Visibility Score
            </Text>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>
                {swipeAnalytics.visibilityScore}
              </Text>
              <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                /100
              </Text>
            </View>
          </View>
        </View>

        {/* Best Time to Be Active */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Best Time to Be Active
          </Text>
          
          <View style={styles.bestTimeCard}>
            <Icon name="schedule" size={32} color={theme.colors.primary} />
            <View style={styles.bestTimeInfo}>
              <Text style={[styles.bestTimeDay, { color: theme.colors.text }]}>
                {swipeAnalytics.bestTimeToBeActive.dayOfWeek}
              </Text>
              <Text style={[styles.bestTimeHours, { color: theme.colors.primary }]}>
                {swipeAnalytics.bestTimeToBeActive.hourRange}
              </Text>
              <Text style={[styles.bestTimeChance, { color: theme.colors.textSecondary }]}>
                {(swipeAnalytics.bestTimeToBeActive.matchProbability * 100).toFixed(0)}% match probability
              </Text>
            </View>
          </View>

          <LineChart
            data={{
              labels: swipeAnalytics.swipePatterns.peakSwipeTimes.map(t => `${t.hour}:00`),
              datasets: [{
                data: swipeAnalytics.swipePatterns.peakSwipeTimes.map(t => t.count),
              }],
            }}
            width={CHART_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Competition Analysis */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Competition Analysis
          </Text>
          
          <View style={styles.competitionMetrics}>
            <View style={styles.competitionItem}>
              <Text style={[styles.competitionLabel, { color: theme.colors.textSecondary }]}>
                Your Score
              </Text>
              <Text style={[styles.competitionValue, { color: theme.colors.primary }]}>
                {swipeAnalytics.competitionAnalysis.yourScore}
              </Text>
            </View>
            
            <View style={styles.competitionDivider} />
            
            <View style={styles.competitionItem}>
              <Text style={[styles.competitionLabel, { color: theme.colors.textSecondary }]}>
                Average Score
              </Text>
              <Text style={[styles.competitionValue, { color: theme.colors.text }]}>
                {swipeAnalytics.competitionAnalysis.averageCompetitorScore}
              </Text>
            </View>
            
            <View style={styles.competitionDivider} />
            
            <View style={styles.competitionItem}>
              <Text style={[styles.competitionLabel, { color: theme.colors.textSecondary }]}>
                Your Percentile
              </Text>
              <Text style={[styles.competitionValue, { color: theme.colors.accent }]}>
                Top {100 - swipeAnalytics.competitionAnalysis.percentile}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const getColorForSource = (source: ViewSource): string => {
    const colors = {
      [ViewSource.SEARCH]: '#FF6B6B',
      [ViewSource.RECOMMENDATIONS]: '#4ECDC4',
      [ViewSource.DIRECT]: '#45B7D1',
      [ViewSource.SUPER_LIKE]: '#FFD700',
      [ViewSource.BOOST]: '#9B59B6',
    };
    return colors[source] || theme.colors.primary;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading Analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Your Analytics
        </Text>
        <TouchableOpacity style={styles.exportButton}>
          <Icon name="share" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: theme.colors.surface }]}>
        {[
          { key: MetricPeriod.DAILY, label: 'Day' },
          { key: MetricPeriod.WEEKLY, label: 'Week' },
          { key: MetricPeriod.MONTHLY, label: 'Month' },
          { key: MetricPeriod.YEARLY, label: 'Year' },
        ].map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodButton,
              period === p.key && { backgroundColor: theme.colors.primaryLight },
            ]}
            onPress={() => setPeriod(p.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                { color: period === p.key ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabNav, { backgroundColor: theme.colors.surface }]}>
        {[
          { key: 'profile', label: 'Profile', icon: 'person' },
          { key: 'matches', label: 'Matches', icon: 'favorite' },
          { key: 'photos', label: 'Photos', icon: 'photo' },
          { key: 'swipes', label: 'Swipes', icon: 'swipe' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'profile' && renderProfileAnalytics()}
      {activeTab === 'matches' && renderMatchAnalytics()}
      {activeTab === 'photos' && renderPhotoAnalytics()}
      {activeTab === 'swipes' && renderSwipeAnalytics()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  exportButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  progressMetrics: {
    gap: 16,
  },
  progressItem: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  totalMetric: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  photoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  photoPosition: {
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoPositionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoStats: {
    flex: 1,
    gap: 4,
  },
  photoStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoStatText: {
    fontSize: 12,
  },
  photoPerformance: {
    alignItems: 'center',
  },
  likeRate: {
    fontSize: 20,
    fontWeight: '600',
  },
  likeRateLabel: {
    fontSize: 10,
  },
  swipeRates: {
    gap: 20,
  },
  swipeRateItem: {
    gap: 8,
  },
  swipeRateTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  swipeBarContainer: {
    gap: 8,
  },
  swipeBar: {
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  swipeBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  swipePercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  visibilityScore: {
    alignItems: 'center',
    marginTop: 24,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 14,
  },
  bestTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 20,
    gap: 16,
  },
  bestTimeInfo: {
    flex: 1,
  },
  bestTimeDay: {
    fontSize: 18,
    fontWeight: '600',
  },
  bestTimeHours: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 4,
  },
  bestTimeChance: {
    fontSize: 14,
  },
  competitionMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  competitionItem: {
    alignItems: 'center',
    flex: 1,
  },
  competitionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  competitionValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  competitionDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default UserAnalyticsScreen;