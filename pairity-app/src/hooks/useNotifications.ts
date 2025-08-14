import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Toast from 'react-native-toast-message';
import {
  addNotification,
  markAsRead,
  showBanner,
  hideBanner,
  updateBadgeCount,
} from '@/store/slices/notificationSlice';
import {
  NotificationItem,
  InAppNotificationBanner,
  NotificationType,
} from '@/types/notifications';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const notificationState = useSelector((state: RootState) => state.notifications);

  // Show toast notification
  const showToast = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message?: string,
    options?: {
      duration?: number;
      position?: 'top' | 'bottom';
      onPress?: () => void;
    }
  ) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: options?.duration || 4000,
      position: options?.position || 'top',
      onPress: options?.onPress,
      topOffset: 60,
      bottomOffset: 100,
    });
  }, []);

  // Show in-app banner
  const showBannerNotification = useCallback((banner: Omit<InAppNotificationBanner, 'id'>) => {
    const id = `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    dispatch(showBanner({
      ...banner,
      id,
      duration: banner.duration || 5000,
    }));
  }, [dispatch]);

  // Add notification to list
  const addNotificationToList = useCallback((notification: NotificationItem) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    dispatch(markAsRead(notificationId));
  }, [dispatch]);

  // Hide banner
  const hideBannerNotification = useCallback((bannerId: string) => {
    dispatch(hideBanner(bannerId));
  }, [dispatch]);

  // Update tab badge count
  const updateTabBadge = useCallback((tab: string, count: number) => {
    dispatch(updateBadgeCount({ tab, count }));
  }, [dispatch]);

  // Convenience methods for specific notification types
  const showSuccessToast = useCallback((title: string, message?: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const showErrorToast = useCallback((title: string, message?: string) => {
    showToast('error', title, message);
  }, [showToast]);

  const showInfoToast = useCallback((title: string, message?: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const showWarningToast = useCallback((title: string, message?: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  // Show match notification
  const showMatchNotification = useCallback((matchData: {
    matchedUserName: string;
    matchedUserPhoto: string;
    onViewProfile: () => void;
    onSendMessage: () => void;
  }) => {
    showBannerNotification({
      type: 'match',
      title: 'It\'s a Match! 🎉',
      message: `You and ${matchData.matchedUserName} liked each other`,
      avatar: matchData.matchedUserPhoto,
      duration: 8000,
      actions: [
        {
          text: 'Say Hi',
          onPress: matchData.onSendMessage,
        },
        {
          text: 'View Profile',
          onPress: matchData.onViewProfile,
        },
      ],
    });
  }, [showBannerNotification]);

  // Show message notification
  const showMessageNotification = useCallback((messageData: {
    senderName: string;
    senderPhoto: string;
    messagePreview: string;
    onReply: () => void;
    onViewChat: () => void;
  }) => {
    showBannerNotification({
      type: 'message',
      title: messageData.senderName,
      message: messageData.messagePreview,
      avatar: messageData.senderPhoto,
      duration: 6000,
      actions: [
        {
          text: 'Reply',
          onPress: messageData.onReply,
        },
      ],
      onPress: messageData.onViewChat,
    });
  }, [showBannerNotification]);

  // Create system notification
  const createSystemNotification = useCallback((
    title: string,
    message: string,
    data?: any
  ): NotificationItem => ({
    id: `system_${Date.now()}`,
    type: NotificationType.SYSTEM,
    title,
    message,
    timestamp: new Date(),
    read: false,
    data,
  }), []);

  // Create match notification
  const createMatchNotification = useCallback((
    matchedUserId: string,
    matchedUserName: string,
    matchedUserPhoto: string
  ): NotificationItem => ({
    id: `match_${matchedUserId}_${Date.now()}`,
    type: NotificationType.MATCH,
    title: 'New Match!',
    message: `You and ${matchedUserName} liked each other`,
    timestamp: new Date(),
    read: false,
    data: {
      matchedUserId,
      matchedUserName,
      matchedUserPhoto,
    },
  }), []);

  // Create like notification
  const createLikeNotification = useCallback((
    likerUserId: string,
    likerUserName: string,
    likerUserPhoto?: string,
    isBlurred = false
  ): NotificationItem => ({
    id: `like_${likerUserId}_${Date.now()}`,
    type: NotificationType.LIKE,
    title: 'Someone liked you!',
    message: isBlurred ? 'Someone liked you!' : `${likerUserName} liked you!`,
    timestamp: new Date(),
    read: false,
    data: {
      likerUserId,
      likerUserName,
      likerUserPhoto,
      isBlurred,
    },
  }), []);

  // Create message notification
  const createMessageNotification = useCallback((
    senderId: string,
    senderName: string,
    senderPhoto: string,
    messagePreview: string,
    chatId: string,
    messageType: 'text' | 'image' | 'video' | 'audio' | 'gif' = 'text'
  ): NotificationItem => ({
    id: `message_${senderId}_${Date.now()}`,
    type: NotificationType.MESSAGE,
    title: 'New Message',
    message: `${senderName}: ${messagePreview}`,
    timestamp: new Date(),
    read: false,
    data: {
      senderId,
      senderName,
      senderPhoto,
      messagePreview,
      chatId,
      messageType,
    },
  }), []);

  // Get unread count by type
  const getUnreadCountByType = useCallback((type: NotificationType) => {
    return notificationState.notifications.filter(
      (notification) => !notification.read && notification.type === type
    ).length;
  }, [notificationState.notifications]);

  // Get total unread count
  const getTotalUnreadCount = useCallback(() => {
    return notificationState.unreadCount;
  }, [notificationState.unreadCount]);

  return {
    // State
    notifications: notificationState.notifications,
    unreadCount: notificationState.unreadCount,
    activeBanners: notificationState.activeBanners,
    preferences: notificationState.preferences,
    
    // Toast methods
    showToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
    
    // Banner methods
    showBannerNotification,
    hideBannerNotification,
    showMatchNotification,
    showMessageNotification,
    
    // Notification management
    addNotificationToList,
    markNotificationAsRead,
    updateTabBadge,
    
    // Factory methods
    createSystemNotification,
    createMatchNotification,
    createLikeNotification,
    createMessageNotification,
    
    // Utility methods
    getUnreadCountByType,
    getTotalUnreadCount,
  };
};