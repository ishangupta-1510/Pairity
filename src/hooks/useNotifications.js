import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addMatch } from '../store/slices/matchSlice';
import { addMessage } from '../store/slices/chatSlice';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [permission, setPermission] = useState(null);
  
  const notificationListener = useRef();
  const responseListener = useRef();
  const dispatch = useDispatch();

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Push Notifications',
        'Failed to get push token for push notification! Please enable notifications in settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);
    setPermission('granted');

    return token;
  }, []);

  // Schedule local notification
  const scheduleNotification = useCallback(async (title, body, data = {}, seconds = 1) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        badge: 1,
      },
      trigger: { seconds },
    });
  }, []);

  // Show instant notification
  const showNotification = useCallback(async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  // Get badge count
  const getBadgeCount = useCallback(async () => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  // Handle notification received
  const handleNotificationReceived = useCallback((notification) => {
    setNotification(notification);
    
    const { type, data } = notification.request.content.data;
    
    switch (type) {
      case 'new_match':
        dispatch(addMatch(data.match));
        break;
      case 'new_message':
        dispatch(addMessage({
          matchId: data.matchId,
          message: data.message,
        }));
        break;
      case 'like_received':
        // Handle like received
        break;
      case 'profile_visitor':
        // Handle profile visitor
        break;
      default:
        break;
    }
  }, [dispatch]);

  // Handle notification response (when user taps on notification)
  const handleNotificationResponse = useCallback((response) => {
    const { type, data } = response.notification.request.content.data;
    
    switch (type) {
      case 'new_match':
        // Navigate to match screen
        console.log('Navigate to match:', data.matchId);
        break;
      case 'new_message':
        // Navigate to chat
        console.log('Navigate to chat:', data.matchId);
        break;
      case 'like_received':
        // Navigate to likes
        console.log('Navigate to likes');
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Send push token to backend
  const sendPushTokenToServer = useCallback(async (token) => {
    try {
      // This would be an API call to your backend
      // await api.post('/users/push-token', { token });
      console.log('Push token:', token);
    } catch (error) {
      console.error('Failed to send push token:', error);
    }
  }, []);

  // Test notifications
  const testNotifications = useCallback(() => {
    showNotification(
      '💛 It\'s a Match!',
      'You and Sarah matched! Start a conversation now.',
      { type: 'new_match', matchId: 'test-match-id' }
    );
  }, [showNotification]);

  return {
    expoPushToken,
    notification,
    permission,
    registerForPushNotifications,
    scheduleNotification,
    showNotification,
    cancelAllNotifications,
    getBadgeCount,
    setBadgeCount,
    sendPushTokenToServer,
    testNotifications,
  };
};