import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, NotificationItem, NotificationFilterType, NotificationPreferences, InAppNotificationBanner } from '@/types/notifications';

const initialNotificationPreferences: NotificationPreferences = {
  pushNotifications: {
    enabled: true,
    matches: true,
    likes: true,
    messages: true,
    profileViews: true,
    system: true,
    premium: true,
  },
  inAppNotifications: {
    enabled: true,
    banners: true,
    toasts: true,
    sounds: true,
    vibration: true,
  },
  emailNotifications: {
    enabled: true,
    matches: true,
    weeklyDigest: true,
    promotions: false,
  },
  smsNotifications: {
    enabled: false,
    matches: false,
    securityAlerts: true,
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  frequency: {
    immediate: true,
    batched: false,
    batchInterval: 60,
  },
  doNotDisturb: {
    enabled: false,
    weekends: false,
    weekdays: false,
  },
};

const initialState: NotificationState & {
  preferences: NotificationPreferences;
  activeBanners: InAppNotificationBanner[];
  fcmToken?: string;
  permissionGranted: boolean;
} = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  filters: {
    activeTab: NotificationFilterType.ALL,
    showRead: true,
  },
  preferences: initialNotificationPreferences,
  activeBanners: [],
  permissionGranted: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      const existingIndex = state.notifications.findIndex(n => n.id === action.payload.id);
      if (existingIndex >= 0) {
        state.notifications[existingIndex] = action.payload;
      } else {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
      state.lastFetched = new Date();
    },

    addNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      const newNotifications = action.payload.filter(
        newNotif => !state.notifications.some(existing => existing.id === newNotif.id)
      );
      state.notifications = [...newNotifications, ...state.notifications];
      state.unreadCount = state.notifications.filter(n => !n.read).length;
      state.lastFetched = new Date();
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index >= 0) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    setActiveFilter: (state, action: PayloadAction<NotificationFilterType>) => {
      state.filters.activeTab = action.payload;
    },

    setShowRead: (state, action: PayloadAction<boolean>) => {
      state.filters.showRead = action.payload;
    },

    updatePreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    updatePushPreferences: (state, action: PayloadAction<Partial<NotificationPreferences['pushNotifications']>>) => {
      state.preferences.pushNotifications = { 
        ...state.preferences.pushNotifications, 
        ...action.payload 
      };
    },

    updateInAppPreferences: (state, action: PayloadAction<Partial<NotificationPreferences['inAppNotifications']>>) => {
      state.preferences.inAppNotifications = { 
        ...state.preferences.inAppNotifications, 
        ...action.payload 
      };
    },

    updateEmailPreferences: (state, action: PayloadAction<Partial<NotificationPreferences['emailNotifications']>>) => {
      state.preferences.emailNotifications = { 
        ...state.preferences.emailNotifications, 
        ...action.payload 
      };
    },

    updateSmsPreferences: (state, action: PayloadAction<Partial<NotificationPreferences['smsNotifications']>>) => {
      state.preferences.smsNotifications = { 
        ...state.preferences.smsNotifications, 
        ...action.payload 
      };
    },

    updateQuietHours: (state, action: PayloadAction<Partial<NotificationPreferences['quietHours']>>) => {
      state.preferences.quietHours = { 
        ...state.preferences.quietHours, 
        ...action.payload 
      };
    },

    setFcmToken: (state, action: PayloadAction<string>) => {
      state.fcmToken = action.payload;
    },

    setPermissionGranted: (state, action: PayloadAction<boolean>) => {
      state.permissionGranted = action.payload;
    },

    // In-app banner notifications
    showBanner: (state, action: PayloadAction<InAppNotificationBanner>) => {
      // Remove existing banner with same id
      state.activeBanners = state.activeBanners.filter(b => b.id !== action.payload.id);
      state.activeBanners.push(action.payload);
    },

    hideBanner: (state, action: PayloadAction<string>) => {
      state.activeBanners = state.activeBanners.filter(b => b.id !== action.payload);
    },

    hideAllBanners: (state) => {
      state.activeBanners = [];
    },

    // Badge counts for tabs
    updateBadgeCount: (state, action: PayloadAction<{ tab: string; count: number }>) => {
      // This will be used by the tab navigator to show badge counts
    },

    clearBadgeCount: (state, action: PayloadAction<string>) => {
      // Clear badge count for specific tab
    },
  },
});

export const {
  setLoading,
  addNotification,
  addNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setActiveFilter,
  setShowRead,
  updatePreferences,
  updatePushPreferences,
  updateInAppPreferences,
  updateEmailPreferences,
  updateSmsPreferences,
  updateQuietHours,
  setFcmToken,
  setPermissionGranted,
  showBanner,
  hideBanner,
  hideAllBanners,
  updateBadgeCount,
  clearBadgeCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;