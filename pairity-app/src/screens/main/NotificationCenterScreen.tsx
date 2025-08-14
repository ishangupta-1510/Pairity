import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';

import {
  markAllAsRead,
  clearAllNotifications,
  setActiveFilter,
  markAsRead,
  removeNotification,
} from '@/store/slices/notificationSlice';
import {
  NotificationItem,
  NotificationType,
  NotificationFilterType,
} from '@/types/notifications';

import NotificationCard from '@/components/notifications/NotificationCard';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';

interface Route {
  key: NotificationFilterType;
  title: string;
  icon: string;
}

const NotificationCenterScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const {
    notifications,
    unreadCount,
    loading,
    filters: { activeTab },
  } = useSelector((state: RootState) => state.notifications);

  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [routes] = useState<Route[]>([
    { key: NotificationFilterType.ALL, title: 'All', icon: 'inbox' },
    { key: NotificationFilterType.MATCHES, title: 'Matches', icon: 'favorite' },
    { key: NotificationFilterType.MESSAGES, title: 'Messages', icon: 'chat' },
    { key: NotificationFilterType.LIKES, title: 'Likes', icon: 'thumb-up' },
    { key: NotificationFilterType.SYSTEM, title: 'System', icon: 'settings' },
  ]);

  const scrollY = new Animated.Value(0);

  useEffect(() => {
    // Set active filter based on tab index
    const currentRoute = routes[index];
    if (currentRoute && activeTab !== currentRoute.key) {
      dispatch(setActiveFilter(currentRoute.key));
    }
  }, [index, routes, activeTab, dispatch]);

  const getFilteredNotifications = useCallback((filterType: NotificationFilterType) => {
    switch (filterType) {
      case NotificationFilterType.ALL:
        return notifications;
      case NotificationFilterType.MATCHES:
        return notifications.filter(n => n.type === NotificationType.MATCH);
      case NotificationFilterType.MESSAGES:
        return notifications.filter(n => n.type === NotificationType.MESSAGE);
      case NotificationFilterType.LIKES:
        return notifications.filter(n => n.type === NotificationType.LIKE);
      case NotificationFilterType.SYSTEM:
        return notifications.filter(n => [
          NotificationType.SYSTEM,
          NotificationType.PREMIUM,
          NotificationType.SAFETY,
          NotificationType.UPDATE,
          NotificationType.PROFILE_VIEW,
        ].includes(n.type));
      default:
        return notifications;
    }
  }, [notifications]);

  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) return;
    
    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: () => dispatch(markAllAsRead()),
        },
      ]
    );
  }, [unreadCount, dispatch]);

  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) return;
    
    Alert.alert(
      'Clear All Notifications',
      'This will permanently delete all notifications. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => dispatch(clearAllNotifications()),
        },
      ]
    );
  }, [notifications.length, dispatch]);

  const handleNotificationPress = useCallback((notification: NotificationItem) => {
    // Mark as read if not already read
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case NotificationType.MATCH:
        navigation.navigate('MatchDetails' as never, { matchId: notification.data?.matchedUserId } as never);
        break;
      case NotificationType.MESSAGE:
        navigation.navigate('Chat' as never, { chatId: notification.data?.chatId } as never);
        break;
      case NotificationType.LIKE:
        navigation.navigate('Profile' as never, { userId: notification.data?.likerUserId } as never);
        break;
      case NotificationType.PROFILE_VIEW:
        navigation.navigate('ProfileViews' as never);
        break;
      default:
        if (notification.data?.actionUrl) {
          // Handle deep link
          console.log('Navigate to:', notification.data.actionUrl);
        }
        break;
    }
  }, [dispatch, navigation]);

  const handleNotificationDismiss = useCallback((notificationId: string) => {
    dispatch(removeNotification(notificationId));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual refresh logic with API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderNotificationList = useCallback(({ route }: { route: Route }) => {
    const filteredNotifications = getFilteredNotifications(route.key);

    const renderNotification = ({ item }: { item: NotificationItem }) => (
      <NotificationCard
        notification={item}
        onPress={() => handleNotificationPress(item)}
        onDismiss={() => handleNotificationDismiss(item.id)}
      />
    );

    if (filteredNotifications.length === 0) {
      return <EmptyNotifications filterType={route.key} />;
    }

    return (
      <Animated.FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />
    );
  }, [
    getFilteredNotifications,
    handleNotificationPress,
    handleNotificationDismiss,
    refreshing,
    onRefresh,
    theme.colors.primary,
    scrollY,
  ]);

  const renderScene = SceneMap(
    routes.reduce((scenes, route) => ({
      ...scenes,
      [route.key]: () => renderNotificationList({ route }),
    }), {})
  );

  const renderTabBar = useCallback((props: any) => (
    <TabBar
      {...props}
      indicatorStyle={[styles.indicator, { backgroundColor: theme.colors.primary }]}
      style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}
      tabStyle={styles.tab}
      renderLabel={({ route, focused }) => (
        <View style={styles.tabLabelContainer}>
          <Icon
            name={route.icon}
            size={20}
            color={focused ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: focused ? theme.colors.primary : theme.colors.textSecondary,
              },
            ]}
          >
            {route.title}
          </Text>
        </View>
      )}
      scrollEnabled
      pressColor={theme.colors.primaryLight}
    />
  ), [theme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={[styles.actionButton, { backgroundColor: theme.colors.primaryLight }]}
            >
              <Icon name="done-all" size={18} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Mark All Read
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationSettings' as never)}
            style={styles.settingsButton}
          >
            <Icon name="settings" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={styles.settingsButton}
            >
              <Icon name="delete-sweep" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab View */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        swipeEnabled={true}
        lazy={true}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
  },
  tabBar: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    width: 90,
  },
  indicator: {
    height: 2,
    borderRadius: 1,
  },
  tabLabelContainer: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'none',
  },
  notificationsList: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default NotificationCenterScreen;