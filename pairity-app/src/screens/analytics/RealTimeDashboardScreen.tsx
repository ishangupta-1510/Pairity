import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import MapView, { Marker, Heatmap } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

import { RealTimeMetrics } from '@/types/analytics';
import { analyticsService } from '@/services/analyticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RealTimeDashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countUpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load initial metrics
    loadMetrics();

    // Connect to real-time updates
    const unsubscribe = analyticsService.connectToRealTime((newMetrics) => {
      setMetrics(newMetrics);
      animateCountUp();
    });

    // Start pulse animation
    startPulseAnimation();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadMetrics = async () => {
    const data = await analyticsService.getRealTimeMetrics();
    setMetrics(data);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateCountUp = () => {
    Animated.timing(countUpAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      countUpAnim.setValue(0);
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spike': return 'trending-up';
      case 'anomaly': return 'warning';
      case 'system': return 'settings';
      case 'fraud': return 'security';
      case 'abuse': return 'report';
      default: return 'info';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF5722';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return theme.colors.textSecondary;
    }
  };

  if (!metrics) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Connecting to real-time data...
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
          Real-Time Dashboard
        </Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.liveText, { color: '#4CAF50' }]}>LIVE</Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Live Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.metricGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="people" size={24} color="white" />
              <Animated.Text 
                style={[
                  styles.metricValue,
                  {
                    color: 'white',
                    opacity: countUpAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.6, 1],
                    }),
                  },
                ]}
              >
                {metrics.activeUsersNow.toLocaleString()}
              </Animated.Text>
              <Text style={styles.metricLabel}>Active Now</Text>
            </LinearGradient>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.accentLight]}
              style={styles.metricGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="swipe" size={24} color="white" />
              <Animated.Text 
                style={[
                  styles.metricValue,
                  {
                    color: 'white',
                    opacity: countUpAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.6, 1],
                    }),
                  },
                ]}
              >
                {metrics.currentSwipesPerMinute}
              </Animated.Text>
              <Text style={styles.metricLabel}>Swipes/min</Text>
            </LinearGradient>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8787']}
              style={styles.metricGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="favorite" size={24} color="white" />
              <Animated.Text 
                style={[
                  styles.metricValue,
                  {
                    color: 'white',
                    opacity: countUpAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.6, 1],
                    }),
                  },
                ]}
              >
                {metrics.matchesHappeningNow}
              </Animated.Text>
              <Text style={styles.metricLabel}>New Matches</Text>
            </LinearGradient>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.metricGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="message" size={24} color="white" />
              <Animated.Text 
                style={[
                  styles.metricValue,
                  {
                    color: 'white',
                    opacity: countUpAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.6, 1],
                    }),
                  },
                ]}
              >
                {metrics.messagesBeingSent}
              </Animated.Text>
              <Text style={styles.metricLabel}>Messages/min</Text>
            </LinearGradient>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.metricGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="videocam" size={24} color="white" />
              <Animated.Text 
                style={[
                  styles.metricValue,
                  {
                    color: 'white',
                    opacity: countUpAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.6, 1],
                    }),
                  },
                ]}
              >
                {metrics.videoCallsActive}
              </Animated.Text>
              <Text style={styles.metricLabel}>Video Calls</Text>
            </LinearGradient>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={['#F093FB', '#F5576C']}
              style={styles.metricGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="trending-up" size={24} color="white" />
              <Animated.Text 
                style={[
                  styles.metricValue,
                  {
                    color: 'white',
                    opacity: countUpAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.6, 1],
                    }),
                  },
                ]}
              >
                +{Math.floor(Math.random() * 20 + 5)}%
              </Animated.Text>
              <Text style={styles.metricLabel}>Growth Rate</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Activity Heatmap */}
        <View style={[styles.mapCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Global Activity Map
          </Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 39.8283,
              longitude: -98.5795,
              latitudeDelta: 50,
              longitudeDelta: 50,
            }}
            customMapStyle={darkMapStyle}
          >
            {metrics.activeLocations.map((location, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                opacity={location.intensity}
              >
                <View style={styles.mapMarker}>
                  <Animated.View 
                    style={[
                      styles.mapMarkerPulse,
                      {
                        backgroundColor: theme.colors.primary,
                        transform: [{ scale: pulseAnim }],
                        opacity: location.intensity,
                      },
                    ]}
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* System Alerts */}
        {metrics.systemAlerts.length > 0 && (
          <View style={[styles.alertsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.alertsHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                System Alerts
              </Text>
              <View style={styles.alertCount}>
                <Text style={styles.alertCountText}>{metrics.systemAlerts.length}</Text>
              </View>
            </View>
            
            {metrics.systemAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertItem,
                  { backgroundColor: theme.colors.background },
                  selectedAlert === alert.id && styles.alertItemSelected,
                ]}
                onPress={() => setSelectedAlert(alert.id === selectedAlert ? null : alert.id)}
              >
                <View style={styles.alertIcon}>
                  <Icon 
                    name={getAlertIcon(alert.type)} 
                    size={20} 
                    color={getAlertColor(alert.severity)} 
                  />
                </View>
                
                <View style={styles.alertContent}>
                  <Text style={[styles.alertMessage, { color: theme.colors.text }]}>
                    {alert.message}
                  </Text>
                  <Text style={[styles.alertTime, { color: theme.colors.textSecondary }]}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                
                <View 
                  style={[
                    styles.alertSeverity,
                    { backgroundColor: getAlertColor(alert.severity) },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Live Activity Feed */}
        <View style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Live Activity Feed
          </Text>
          
          <View style={styles.activityFeed}>
            {[...Array(5)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.activityItem,
                  {
                    opacity: countUpAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                    transform: [
                      {
                        translateX: countUpAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.activityDot, { backgroundColor: getRandomActivityColor() }]} />
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  {getRandomActivity()}
                </Text>
                <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>
                  Just now
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getRandomActivity = () => {
  const activities = [
    'New match in New York',
    'Video call started in London',
    'Super like sent in Paris',
    'Profile boost activated',
    'Message conversation started',
    'Photo verification completed',
    'Premium subscription activated',
    'Profile view spike detected',
  ];
  return activities[Math.floor(Math.random() * activities.length)];
};

const getRandomActivityColor = () => {
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
];

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
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 32) / 2,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  mapCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  mapMarker: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarkerPulse: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.7,
  },
  alertsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  alertCount: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  alertCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertItemSelected: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  alertIcon: {
    width: 32,
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
  },
  alertSeverity: {
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  activityCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  activityFeed: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
  },
});

export default RealTimeDashboardScreen;