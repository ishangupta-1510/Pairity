import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {
  AndroidNotification,
  AndroidNotificationChannel,
  AndroidNotificationAction,
} from '@/types/android';

class FCMService {
  private isInitialized: boolean = false;
  private fcmToken: string | null = null;
  private notificationChannels: Map<string, AndroidNotificationChannel> = new Map();

  /**
   * Initialize FCM service
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'android') {
      console.log('FCMService is Android only');
      return;
    }

    if (this.isInitialized) return;

    // Create notification channels
    this.createNotificationChannels();

    // Configure PushNotification
    PushNotification.configure({
      onRegister: (token) => {
        console.log('FCM Token:', token.token);
        this.fcmToken = token.token;
      },

      onNotification: (notification) => {
        this.handleNotification(notification);
      },

      onAction: (notification) => {
        this.handleNotificationAction(notification);
      },

      onRegistrationError: (error) => {
        console.error('FCM registration failed:', error);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: false,
    });

    // Setup Firebase messaging handlers
    this.setupMessageHandlers();

    this.isInitialized = true;
  }

  /**
   * Create notification channels
   */
  private createNotificationChannels(): void {
    const channels: AndroidNotificationChannel[] = [
      {
        channelId: 'matches',
        channelName: 'Matches',
        channelDescription: 'New matches and match activity',
        importance: 'high',
        playSound: true,
        vibrate: true,
        showBadge: true,
        enableLights: true,
        lightColor: '#FF7979',
      },
      {
        channelId: 'messages',
        channelName: 'Messages',
        channelDescription: 'Chat messages',
        importance: 'high',
        playSound: true,
        vibrate: true,
        showBadge: true,
        enableLights: true,
        lightColor: '#FF7979',
      },
      {
        channelId: 'likes',
        channelName: 'Likes',
        channelDescription: 'Profile likes and super likes',
        importance: 'default',
        playSound: true,
        vibrate: false,
        showBadge: true,
        enableLights: false,
      },
      {
        channelId: 'general',
        channelName: 'General',
        channelDescription: 'General app notifications',
        importance: 'low',
        playSound: false,
        vibrate: false,
        showBadge: false,
        enableLights: false,
      },
    ];

    channels.forEach((channel) => {
      this.createChannel(channel);
      this.notificationChannels.set(channel.channelId, channel);
    });
  }

  /**
   * Create a notification channel
   */
  private createChannel(channel: AndroidNotificationChannel): void {
    PushNotification.createChannel(
      {
        channelId: channel.channelId,
        channelName: channel.channelName,
        channelDescription: channel.channelDescription,
        playSound: channel.playSound,
        soundName: channel.soundName || 'default',
        importance: this.mapImportance(channel.importance),
        vibrate: channel.vibrate,
      },
      (created) => console.log(`Channel '${channel.channelId}' created:`, created)
    );
  }

  /**
   * Setup Firebase message handlers
   */
  private setupMessageHandlers(): void {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      console.log('FCM foreground message:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('FCM background message:', remoteMessage);
      // Handle background message
    });

    // Notification opened handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // Check if app was opened from notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await this.getToken();
      }

      return enabled;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    if (Platform.OS !== 'android') return null;

    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Show local notification
   */
  private showLocalNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { notification, data } = remoteMessage;
    
    if (!notification) return;

    const androidNotification: AndroidNotification = {
      id: remoteMessage.messageId || Date.now().toString(),
      title: notification.title || '',
      body: notification.body || '',
      channelId: data?.channelId || 'general',
      smallIcon: 'ic_notification',
      largeIcon: data?.largeIcon,
      bigPictureUrl: data?.bigPictureUrl,
      color: '#FF7979',
      tag: data?.tag,
      group: data?.group,
      autoCancel: true,
      priority: 'high',
      visibility: 'public',
      data: data as Record<string, any>,
    };

    this.showNotification(androidNotification);
  }

  /**
   * Show notification
   */
  showNotification(notification: AndroidNotification): void {
    PushNotification.localNotification({
      id: notification.id,
      title: notification.title,
      message: notification.body,
      channelId: notification.channelId,
      smallIcon: notification.smallIcon,
      largeIcon: notification.largeIcon,
      bigText: notification.bigText,
      bigPictureUrl: notification.bigPictureUrl,
      color: notification.color,
      tag: notification.tag,
      group: notification.group,
      groupSummary: notification.groupSummary,
      ticker: notification.ticker,
      autoCancel: notification.autoCancel,
      priority: notification.priority,
      visibility: notification.visibility,
      userInfo: notification.data,
      playSound: true,
      vibrate: true,
    });
  }

  /**
   * Schedule notification
   */
  scheduleNotification(
    notification: AndroidNotification,
    date: Date
  ): void {
    PushNotification.localNotificationSchedule({
      id: notification.id,
      title: notification.title,
      message: notification.body,
      date,
      channelId: notification.channelId,
      userInfo: notification.data,
    });
  }

  /**
   * Cancel notification
   */
  cancelNotification(id: string): void {
    PushNotification.cancelLocalNotification(id);
  }

  /**
   * Cancel all notifications
   */
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Get delivered notifications
   */
  getDeliveredNotifications(callback: (notifications: any[]) => void): void {
    PushNotification.getDeliveredNotifications(callback);
  }

  /**
   * Remove delivered notifications
   */
  removeDeliveredNotifications(identifiers: string[]): void {
    PushNotification.removeDeliveredNotifications(identifiers);
  }

  /**
   * Remove all delivered notifications
   */
  removeAllDeliveredNotifications(): void {
    PushNotification.removeAllDeliveredNotifications();
  }

  /**
   * Set badge count
   */
  setBadgeCount(count: number): void {
    PushNotification.setApplicationIconBadgeNumber(count);
  }

  /**
   * Get badge count
   */
  getBadgeCount(callback: (count: number) => void): void {
    PushNotification.getApplicationIconBadgeNumber(callback);
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
    }
  }

  // Helper methods

  private handleNotification(notification: any): void {
    console.log('Notification received:', notification);
    // Handle notification based on type
  }

  private handleNotificationAction(notification: any): void {
    console.log('Notification action:', notification);
    // Handle notification action
  }

  private handleNotificationOpen(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    console.log('Notification opened:', remoteMessage);
    // Navigate to appropriate screen
  }

  private mapImportance(importance: string): number {
    switch (importance) {
      case 'max':
        return 5;
      case 'high':
        return 4;
      case 'default':
        return 3;
      case 'low':
        return 2;
      case 'min':
        return 1;
      default:
        return 3;
    }
  }
}

export const fcmService = new FCMService();