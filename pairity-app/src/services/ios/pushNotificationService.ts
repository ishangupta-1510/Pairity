import { Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import {
  IOSNotificationSettings,
  IOSNotificationCategory,
  IOSNotificationAction,
  IOSNotificationActionOption,
  IOSNotificationCategoryOption,
} from '@/types/ios';

class IOSPushNotificationService {
  private isInitialized: boolean = false;
  private deviceToken: string | null = null;
  private notificationCategories: Map<string, IOSNotificationCategory> = new Map();

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('IOSPushNotificationService is iOS only');
      return;
    }

    if (this.isInitialized) return;

    // Configure push notifications
    PushNotification.configure({
      onRegister: (token) => {
        this.deviceToken = token.token;
        console.log('APNs Token:', token.token);
      },

      onNotification: (notification) => {
        this.handleNotification(notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      onAction: (notification) => {
        this.handleNotificationAction(notification);
      },

      onRegistrationError: (error) => {
        console.error('Push notification registration failed:', error);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: false, // Don't request on init
    });

    // Setup notification categories
    this.setupNotificationCategories();

    this.isInitialized = true;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<IOSNotificationSettings> {
    if (Platform.OS !== 'ios') {
      throw new Error('This method is iOS only');
    }

    try {
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
        criticalAlert: false,
        announcement: false,
      });

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const settings = await this.getNotificationSettings();
      return settings;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      throw error;
    }
  }

  /**
   * Get current notification settings
   */
  async getNotificationSettings(): Promise<IOSNotificationSettings> {
    if (Platform.OS !== 'ios') {
      throw new Error('This method is iOS only');
    }

    return new Promise((resolve) => {
      PushNotificationIOS.checkPermissions((permissions) => {
        resolve({
          alert: permissions.alert || false,
          badge: permissions.badge || false,
          sound: permissions.sound || false,
          criticalAlert: permissions.criticalAlert || false,
          provisional: false,
          announcement: false,
          authorizationStatus: this.mapAuthorizationStatus(permissions.authorizationStatus),
        });
      });
    });
  }

  /**
   * Setup notification categories and actions
   */
  private setupNotificationCategories(): void {
    // Match category
    const matchCategory: IOSNotificationCategory = {
      identifier: 'MATCH',
      actions: [
        {
          identifier: 'MESSAGE',
          title: 'Send Message',
          options: [IOSNotificationActionOption.FOREGROUND],
        },
        {
          identifier: 'VIEW_PROFILE',
          title: 'View Profile',
          options: [IOSNotificationActionOption.FOREGROUND],
        },
      ],
    };

    // Message category
    const messageCategory: IOSNotificationCategory = {
      identifier: 'MESSAGE',
      actions: [
        {
          identifier: 'REPLY',
          title: 'Reply',
          options: [IOSNotificationActionOption.AUTHENTICATION_REQUIRED],
          textInput: {
            buttonTitle: 'Send',
            placeholder: 'Type your message...',
          },
        },
        {
          identifier: 'MARK_READ',
          title: 'Mark as Read',
          options: [],
        },
      ],
    };

    // Like category
    const likeCategory: IOSNotificationCategory = {
      identifier: 'LIKE',
      actions: [
        {
          identifier: 'LIKE_BACK',
          title: 'Like Back',
          options: [IOSNotificationActionOption.AUTHENTICATION_REQUIRED],
        },
        {
          identifier: 'VIEW',
          title: 'View',
          options: [IOSNotificationActionOption.FOREGROUND],
        },
      ],
    };

    this.notificationCategories.set('MATCH', matchCategory);
    this.notificationCategories.set('MESSAGE', messageCategory);
    this.notificationCategories.set('LIKE', likeCategory);

    // Register categories with iOS
    if (Platform.OS === 'ios') {
      const categories = Array.from(this.notificationCategories.values());
      PushNotificationIOS.setNotificationCategories(categories as any);
    }
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: any): void {
    console.log('Notification received:', notification);

    // Handle based on notification type
    const { data } = notification;
    if (data) {
      switch (data.type) {
        case 'match':
          this.handleMatchNotification(data);
          break;
        case 'message':
          this.handleMessageNotification(data);
          break;
        case 'like':
          this.handleLikeNotification(data);
          break;
        default:
          break;
      }
    }

    // Update badge count
    if (notification.badge !== undefined) {
      PushNotificationIOS.setApplicationIconBadgeNumber(notification.badge);
    }
  }

  /**
   * Handle notification action
   */
  private handleNotificationAction(notification: any): void {
    const { action, userText } = notification;

    switch (action) {
      case 'MESSAGE':
      case 'VIEW_PROFILE':
      case 'VIEW':
        // Navigate to appropriate screen
        this.navigateToScreen(action, notification.data);
        break;
      case 'REPLY':
        if (userText) {
          this.sendQuickReply(notification.data.senderId, userText);
        }
        break;
      case 'MARK_READ':
        this.markMessageAsRead(notification.data.messageId);
        break;
      case 'LIKE_BACK':
        this.sendLikeBack(notification.data.userId);
        break;
      default:
        break;
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    fireDate: Date,
    userInfo?: any,
    category?: string
  ): Promise<void> {
    if (Platform.OS !== 'ios') return;

    PushNotificationIOS.scheduleLocalNotification({
      fireDate: fireDate.toISOString(),
      alertTitle: title,
      alertBody: body,
      userInfo: userInfo || {},
      category,
      isSilent: false,
    });
  }

  /**
   * Cancel scheduled notifications
   */
  async cancelScheduledNotifications(identifiers?: string[]): Promise<void> {
    if (Platform.OS !== 'ios') return;

    if (identifiers) {
      // Cancel specific notifications
      identifiers.forEach((id) => {
        PushNotificationIOS.cancelLocalNotifications({ id });
      });
    } else {
      // Cancel all
      PushNotificationIOS.cancelAllLocalNotifications();
    }
  }

  /**
   * Get delivered notifications
   */
  async getDeliveredNotifications(): Promise<any[]> {
    if (Platform.OS !== 'ios') return [];

    return new Promise((resolve) => {
      PushNotificationIOS.getDeliveredNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }

  /**
   * Remove delivered notifications
   */
  async removeDeliveredNotifications(identifiers?: string[]): Promise<void> {
    if (Platform.OS !== 'ios') return;

    if (identifiers) {
      PushNotificationIOS.removeDeliveredNotifications(identifiers);
    } else {
      PushNotificationIOS.removeAllDeliveredNotifications();
    }
  }

  /**
   * Update badge count
   */
  async updateBadgeCount(count: number): Promise<void> {
    if (Platform.OS !== 'ios') return;

    PushNotificationIOS.setApplicationIconBadgeNumber(count);
  }

  /**
   * Get current badge count
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS !== 'ios') return 0;

    return new Promise((resolve) => {
      PushNotificationIOS.getApplicationIconBadgeNumber((count) => {
        resolve(count);
      });
    });
  }

  /**
   * Register for remote notifications
   */
  async registerForRemoteNotifications(): Promise<void> {
    if (Platform.OS !== 'ios') return;

    PushNotificationIOS.registerForRemoteNotifications();
  }

  /**
   * Get APNs token
   */
  getAPNsToken(): string | null {
    return this.deviceToken;
  }

  /**
   * Enable critical alerts (requires special entitlement)
   */
  async requestCriticalAlertPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      const authStatus = await messaging().requestPermission({
        criticalAlert: true,
      });

      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('Failed to request critical alert permission:', error);
      return false;
    }
  }

  // Helper methods

  private mapAuthorizationStatus(status: number): 'authorized' | 'denied' | 'notDetermined' | 'provisional' {
    switch (status) {
      case 0:
        return 'notDetermined';
      case 1:
        return 'denied';
      case 2:
        return 'authorized';
      case 3:
        return 'provisional';
      default:
        return 'notDetermined';
    }
  }

  private handleMatchNotification(data: any): void {
    // Handle match notification
    console.log('New match:', data);
  }

  private handleMessageNotification(data: any): void {
    // Handle message notification
    console.log('New message:', data);
  }

  private handleLikeNotification(data: any): void {
    // Handle like notification
    console.log('New like:', data);
  }

  private navigateToScreen(action: string, data: any): void {
    // Navigate to appropriate screen based on action
    console.log('Navigate to:', action, data);
  }

  private sendQuickReply(senderId: string, message: string): void {
    // Send quick reply
    console.log('Quick reply to', senderId, ':', message);
  }

  private markMessageAsRead(messageId: string): void {
    // Mark message as read
    console.log('Mark as read:', messageId);
  }

  private sendLikeBack(userId: string): void {
    // Send like back
    console.log('Like back:', userId);
  }
}

export const iosPushNotificationService = new IOSPushNotificationService();