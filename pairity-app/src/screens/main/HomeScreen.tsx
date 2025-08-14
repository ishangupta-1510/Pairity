import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  FlatList,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import CustomHeader from '@/components/CustomHeader';

const { width: screenWidth } = Dimensions.get('window');

interface StatsCard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}

interface RecommendedProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  distance: number;
  matchPercentage: number;
  isOnline: boolean;
}

interface ActivityItem {
  id: string;
  type: 'like' | 'match' | 'message' | 'view';
  user: {
    name: string;
    photo: string;
  };
  timestamp: string;
  message?: string;
}

const HomeScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [statsData, setStatsData] = useState<StatsCard[]>([
    { id: '1', title: 'Profile Views', value: 234, change: '+12%', icon: 'visibility', color: '#4ECDC4' },
    { id: '2', title: 'Matches', value: 18, change: '+3', icon: 'favorite', color: '#FF6B6B' },
    { id: '3', title: 'Likes', value: 56, change: '+8', icon: 'thumb-up', color: '#FFD43B' },
    { id: '4', title: 'Messages', value: 7, change: 'unread', icon: 'chat', color: '#339AF0' },
    { id: '5', title: 'Profile', value: '85%', change: 'complete', icon: 'person', color: '#51CF66' },
  ]);

  const [recommendedProfiles] = useState<RecommendedProfile[]>([
    { id: '1', name: 'Sarah', age: 25, photo: 'https://i.pravatar.cc/300?img=1', distance: 2, matchPercentage: 92, isOnline: true },
    { id: '2', name: 'Emma', age: 27, photo: 'https://i.pravatar.cc/300?img=2', distance: 5, matchPercentage: 88, isOnline: false },
    { id: '3', name: 'Jessica', age: 24, photo: 'https://i.pravatar.cc/300?img=3', distance: 8, matchPercentage: 85, isOnline: true },
    { id: '4', name: 'Ashley', age: 26, photo: 'https://i.pravatar.cc/300?img=4', distance: 12, matchPercentage: 82, isOnline: false },
    { id: '5', name: 'Michelle', age: 28, photo: 'https://i.pravatar.cc/300?img=5', distance: 15, matchPercentage: 79, isOnline: true },
  ]);

  const [activityFeed] = useState<ActivityItem[]>([
    { id: '1', type: 'match', user: { name: 'Sarah', photo: 'https://i.pravatar.cc/100?img=1' }, timestamp: '5 min ago' },
    { id: '2', type: 'like', user: { name: 'Emma', photo: 'https://i.pravatar.cc/100?img=2' }, timestamp: '1 hour ago' },
    { id: '3', type: 'message', user: { name: 'Jessica', photo: 'https://i.pravatar.cc/100?img=3' }, timestamp: '2 hours ago', message: 'Hey! How are you?' },
    { id: '4', type: 'view', user: { name: 'Ashley', photo: 'https://i.pravatar.cc/100?img=4' }, timestamp: '3 hours ago' },
  ]);

  // Chart data
  const profileViewsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 65],
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const matchRateData = {
    labels: ['Match Rate'],
    data: [0.76],
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const renderStatsCard = ({ item }: { item: StatsCard }) => (
    <TouchableOpacity style={[styles.statsCard, { borderLeftColor: item.color }]}>
      <View style={styles.statsIconContainer}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.statsValue}>{item.value}</Text>
      <Text style={styles.statsTitle}>{item.title}</Text>
      {item.change && (
        <Text style={[styles.statsChange, { color: item.change.includes('+') ? '#51CF66' : '#666' }]}>
          {item.change}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRecommendedProfile = ({ item }: { item: RecommendedProfile }) => (
    <TouchableOpacity style={styles.recommendationCard}>
      <ImageBackground
        source={{ uri: item.photo }}
        style={styles.recommendationImage}
        imageStyle={styles.recommendationImageStyle}
      >
        <View style={styles.recommendationOverlay}>
          {item.isOnline && (
            <View style={styles.onlineIndicator}>
              <Icon name="circle" size={8} color="#51CF66" />
            </View>
          )}
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationName}>{item.name}, {item.age}</Text>
            <View style={styles.recommendationMeta}>
              <Icon name="location-on" size={14} color="#fff" />
              <Text style={styles.recommendationDistance}>{item.distance} miles</Text>
            </View>
            <View style={styles.matchPercentageContainer}>
              <Text style={styles.matchPercentage}>{item.matchPercentage}% Match</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
      <View style={styles.recommendationActions}>
        <TouchableOpacity style={[styles.actionButton, styles.passButton]}>
          <Icon name="close" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]}>
          <Icon name="star" size={20} color="#339AF0" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]}>
          <Icon name="favorite" size={20} color="#51CF66" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderActivityItem = ({ item }: { item: ActivityItem }) => {
    const getActivityIcon = () => {
      switch (item.type) {
        case 'match': return { name: 'favorite', color: '#FF6B6B' };
        case 'like': return { name: 'thumb-up', color: '#51CF66' };
        case 'message': return { name: 'chat', color: '#339AF0' };
        case 'view': return { name: 'visibility', color: '#FFD43B' };
        default: return { name: 'info', color: '#666' };
      }
    };

    const getActivityText = () => {
      switch (item.type) {
        case 'match': return `You matched with ${item.user.name}!`;
        case 'like': return `${item.user.name} liked your profile`;
        case 'message': return `${item.user.name}: ${item.message}`;
        case 'view': return `${item.user.name} viewed your profile`;
        default: return '';
      }
    };

    const icon = getActivityIcon();

    return (
      <TouchableOpacity style={styles.activityItem}>
        <ImageBackground
          source={{ uri: item.user.photo }}
          style={styles.activityUserPhoto}
          imageStyle={styles.activityUserPhotoStyle}
        >
          <View style={[styles.activityTypeIcon, { backgroundColor: icon.color }]}>
            <Icon name={icon.name} size={12} color="#fff" />
          </View>
        </ImageBackground>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>{getActivityText()}</Text>
          <Text style={styles.activityTime}>{item.timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        showLogo
        showNotifications
        showProfile
        notificationCount={3}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.firstName || 'User'}! 👋
          </Text>
          <Text style={styles.welcomeSubtext}>
            Here's what's happening with your profile today
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={statsData}
            renderItem={renderStatsCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          
          {/* Profile Views Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Profile Views This Week</Text>
            <LineChart
              data={profileViewsData}
              width={screenWidth - 48}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#FF6B6B',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Match Rate */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Match Rate</Text>
            <ProgressChart
              data={matchRateData}
              width={screenWidth - 48}
              height={200}
              strokeWidth={16}
              radius={60}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(81, 207, 102, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
              }}
              hideLegend={false}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Picks</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreText}>See More</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recommendedProfiles}
            renderItem={renderRecommendedProfile}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recommendationsContainer}
          />
        </View>

        {/* Activity Feed */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <FlatList
            data={activityFeed}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsContainer: {
    paddingRight: 24,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIconContainer: {
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statsChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Charts Section
  chartsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  
  // Recommendations Section
  recommendationsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  recommendationsContainer: {
    paddingRight: 24,
  },
  recommendationCard: {
    marginRight: 16,
    width: 160,
  },
  recommendationImage: {
    width: 160,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recommendationImageStyle: {
    borderRadius: 12,
  },
  recommendationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  recommendationInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 8,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendationDistance: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  matchPercentageContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  matchPercentage: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  recommendationActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderTopWidth: 0,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  passButton: {
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  superLikeButton: {
    borderColor: '#339AF0',
    backgroundColor: '#E7F5FF',
  },
  likeButton: {
    borderColor: '#51CF66',
    backgroundColor: '#F0FDF4',
  },
  
  // Activity Section
  activitySection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityUserPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  activityUserPhotoStyle: {
    borderRadius: 24,
  },
  activityTypeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default HomeScreen;