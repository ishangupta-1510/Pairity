import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { NotificationItem, NotificationType } from '@/types/notifications';
import moment from 'moment';

interface NotificationCardProps {
  notification: NotificationItem;
  onPress: () => void;
  onDismiss: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDismiss,
}) => {
  const theme = useTheme();
  const [translateX] = useState(new Animated.Value(0));
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = () => {
    switch (notification.type) {
      case NotificationType.MATCH:
        return { name: 'favorite', color: theme.colors.premium };
      case NotificationType.LIKE:
        return { name: 'thumb-up', color: '#FF6B6B' };
      case NotificationType.MESSAGE:
        return { name: 'chat', color: theme.colors.primary };
      case NotificationType.PROFILE_VIEW:
        return { name: 'visibility', color: '#4ECDC4' };
      case NotificationType.SYSTEM:
        return { name: 'info', color: theme.colors.accent };
      case NotificationType.PREMIUM:
        return { name: 'star', color: theme.colors.premium };
      case NotificationType.SAFETY:
        return { name: 'security', color: '#FF9800' };
      case NotificationType.UPDATE:
        return { name: 'system-update', color: '#2196F3' };
      default:
        return { name: 'notifications', color: theme.colors.textSecondary };
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    return moment(timestamp).fromNow();
  };

  const getNotificationContent = () => {
    const { data } = notification;

    switch (notification.type) {
      case NotificationType.MATCH:
        return {
          title: `New Match! 🎉`,
          message: `You and ${data?.matchedUserName} liked each other`,
          avatar: data?.matchedUserPhoto,
          actionText: 'Say Hi',
        };

      case NotificationType.LIKE:
        return {
          title: data?.isBlurred && !notification.read 
            ? `Someone liked you!` 
            : `${data?.likerUserName} liked you!`,
          message: data?.totalLikes 
            ? `You have ${data.totalLikes} new likes` 
            : 'Like them back to start a conversation',
          avatar: data?.isBlurred ? undefined : data?.likerUserPhoto,
          actionText: 'View Profile',
        };

      case NotificationType.MESSAGE:
        return {
          title: data?.senderName,
          message: data?.messageType === 'text' 
            ? data?.messagePreview 
            : `Sent ${data?.messageType === 'image' ? 'a photo' : 
                       data?.messageType === 'video' ? 'a video' : 
                       data?.messageType === 'audio' ? 'a voice message' : 
                       'a GIF'}`,
          avatar: data?.senderPhoto,
          actionText: 'Reply',
        };

      case NotificationType.PROFILE_VIEW:
        return {
          title: 'Profile Views',
          message: data?.viewerCount 
            ? `${data.viewerCount} people viewed your profile today`
            : data?.isProfileTrending 
            ? 'Your profile is trending! 📈'
            : 'Someone viewed your profile',
          actionText: 'View Details',
        };

      case NotificationType.SYSTEM:
      case NotificationType.PREMIUM:
      case NotificationType.SAFETY:
      case NotificationType.UPDATE:
        return {
          title: notification.title,
          message: notification.message,
          actionText: data?.actionText || 'Learn More',
        };

      default:
        return {
          title: notification.title,
          message: notification.message,
          actionText: 'View',
        };
    }
  };

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    
    if (translationX < -50) {
      setShowActions(true);
      translateX.setValue(-80);
    } else if (translationX > 50) {
      setShowActions(false);
      translateX.setValue(0);
    } else {
      translateX.setValue(translationX);
    }
  };

  const handleGestureStateChange = (event: any) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      if (translationX < -100) {
        // Dismiss notification
        Animated.timing(translateX, {
          toValue: -400,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      } else if (translationX < -50) {
        // Show actions
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
        }).start();
        setShowActions(true);
      } else {
        // Reset position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setShowActions(false);
      }
    }
  };

  const content = getNotificationContent();
  const iconData = getNotificationIcon();

  return (
    <View style={styles.cardContainer}>
      {/* Action buttons (shown when swiped) */}
      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={onDismiss}
          >
            <Icon name="delete" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderLeftColor: notification.read ? 'transparent' : iconData.color,
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {/* Avatar or Icon */}
            <View style={styles.avatarContainer}>
              {content.avatar ? (
                <Image source={{ uri: content.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: `${iconData.color}20` }]}>
                  <Icon name={iconData.name} size={24} color={iconData.color} />
                </View>
              )}
              
              {/* Unread indicator */}
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.text,
                      fontWeight: notification.read ? '500' : '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {content.title}
                </Text>
                <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                  {getTimeAgo(notification.timestamp)}
                </Text>
              </View>
              
              <Text
                style={[
                  styles.message,
                  {
                    color: notification.read ? theme.colors.textSecondary : theme.colors.text,
                  },
                ]}
                numberOfLines={2}
              >
                {content.message}
              </Text>

              {/* Action button */}
              {content.actionText && (
                <TouchableOpacity
                  style={[styles.actionChip, { backgroundColor: theme.colors.primaryLight }]}
                  onPress={onPress}
                >
                  <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>
                    {content.actionText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Chevron */}
            <Icon 
              name="chevron-right" 
              size={20} 
              color={theme.colors.textSecondary} 
              style={styles.chevron}
            />
          </TouchableOpacity>

          {/* Special effects for match notifications */}
          {notification.type === NotificationType.MATCH && (
            <View style={styles.matchEffects}>
              <Text style={styles.matchEmoji}>✨</Text>
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    borderLeftWidth: 3,
    marginBottom: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    flexShrink: 0,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  actionChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 8,
    marginTop: 2,
  },
  matchEffects: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  matchEmoji: {
    fontSize: 18,
  },
});

export default NotificationCard;