export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
  data?: any;
}

export enum NotificationType {
  MATCH = 'match',
  LIKE = 'like',
  MESSAGE = 'message',
  PROFILE_VIEW = 'profile_view',
  SYSTEM = 'system',
  PREMIUM = 'premium',
  SAFETY = 'safety',
  UPDATE = 'update',
}

export interface MatchNotification extends BaseNotification {
  type: NotificationType.MATCH;
  data: {
    matchedUserId: string;
    matchedUserName: string;
    matchedUserPhoto: string;
    mutualFriends?: number;
  };
}

export interface LikeNotification extends BaseNotification {
  type: NotificationType.LIKE;
  data: {
    likerUserId: string;
    likerUserName: string;
    likerUserPhoto?: string;
    isBlurred: boolean;
    totalLikes?: number;
  };
}

export interface MessageNotification extends BaseNotification {
  type: NotificationType.MESSAGE;
  data: {
    senderId: string;
    senderName: string;
    senderPhoto: string;
    messagePreview: string;
    chatId: string;
    messageType: 'text' | 'image' | 'video' | 'audio' | 'gif';
  };
}

export interface ProfileNotification extends BaseNotification {
  type: NotificationType.PROFILE_VIEW;
  data: {
    viewerCount?: number;
    isProfileTrending?: boolean;
    profileCompleteness?: number;
    boostExpiryDate?: Date;
  };
}

export interface SystemNotification extends BaseNotification {
  type: NotificationType.SYSTEM | NotificationType.PREMIUM | NotificationType.SAFETY | NotificationType.UPDATE;
  data: {
    actionUrl?: string;
    actionText?: string;
    imageUrl?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category?: string;
  };
}

export type NotificationItem = 
  | MatchNotification 
  | LikeNotification 
  | MessageNotification 
  | ProfileNotification 
  | SystemNotification;

export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  lastFetched?: Date;
  filters: {
    activeTab: NotificationFilterType;
    showRead: boolean;
  };
}

export enum NotificationFilterType {
  ALL = 'all',
  MATCHES = 'matches',
  MESSAGES = 'messages', 
  LIKES = 'likes',
  SYSTEM = 'system',
}

export interface NotificationPreferences {
  pushNotifications: {
    enabled: boolean;
    matches: boolean;
    likes: boolean;
    messages: boolean;
    profileViews: boolean;
    system: boolean;
    premium: boolean;
  };
  inAppNotifications: {
    enabled: boolean;
    banners: boolean;
    toasts: boolean;
    sounds: boolean;
    vibration: boolean;
  };
  emailNotifications: {
    enabled: boolean;
    matches: boolean;
    weeklyDigest: boolean;
    promotions: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    matches: boolean;
    securityAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  frequency: {
    immediate: boolean;
    batched: boolean;
    batchInterval: number; // minutes
  };
  doNotDisturb: {
    enabled: boolean;
    weekends: boolean;
    weekdays: boolean;
  };
}

export interface PushNotificationData {
  notificationId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  imageUrl?: string;
  actionButtons?: NotificationAction[];
  sound?: string;
  badge?: number;
  deepLink?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  inputPlaceholder?: string;
  requiresInput?: boolean;
}

export interface InAppNotificationBanner {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'match' | 'message';
  title: string;
  message: string;
  duration?: number;
  avatar?: string;
  onPress?: () => void;
  onDismiss?: () => void;
  actions?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'destructive';
  }>;
}

export interface NotificationAnalytics {
  delivered: number;
  opened: number;
  clicked: number;
  dismissed: number;
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  timestamp: Date;
  notificationType: NotificationType;
}

export interface FCMToken {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android';
  timestamp: Date;
  isActive: boolean;
}