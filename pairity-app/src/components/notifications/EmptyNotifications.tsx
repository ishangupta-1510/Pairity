import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { NotificationFilterType } from '@/types/notifications';

interface EmptyNotificationsProps {
  filterType: NotificationFilterType;
}

const EmptyNotifications: React.FC<EmptyNotificationsProps> = ({ filterType }) => {
  const theme = useTheme();

  const getEmptyStateContent = () => {
    switch (filterType) {
      case NotificationFilterType.MATCHES:
        return {
          icon: 'favorite-border',
          title: 'No Match Notifications',
          message: 'When you get new matches, you\'ll see them here',
          emoji: '💕',
        };
      case NotificationFilterType.MESSAGES:
        return {
          icon: 'chat-bubble-outline',
          title: 'No Message Notifications',
          message: 'New message alerts will appear here',
          emoji: '💬',
        };
      case NotificationFilterType.LIKES:
        return {
          icon: 'thumb-up',
          title: 'No Likes Yet',
          message: 'When someone likes you, you\'ll be notified here',
          emoji: '👍',
        };
      case NotificationFilterType.SYSTEM:
        return {
          icon: 'settings',
          title: 'No System Notifications',
          message: 'App updates and system messages will show here',
          emoji: '⚙️',
        };
      default:
        return {
          icon: 'notifications-none',
          title: 'All Caught Up!',
          message: 'You have no notifications right now',
          emoji: '🎉',
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={styles.emoji}>{content.emoji}</Text>
        <Icon 
          name={content.icon} 
          size={48} 
          color={theme.colors.textSecondary} 
          style={styles.icon}
        />
      </View>
      
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {content.title}
      </Text>
      
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {content.message}
      </Text>

      {filterType === NotificationFilterType.ALL && (
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            💡 Pro Tips:
          </Text>
          <Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
            • Be active to get more matches
          </Text>
          <Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
            • Update your photos regularly
          </Text>
          <Text style={[styles.tip, { color: theme.colors.textSecondary }]}>
            • Complete your profile for better visibility
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  emoji: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 24,
  },
  icon: {
    opacity: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  tipsContainer: {
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 240,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    alignSelf: 'center',
  },
  tip: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 18,
  },
});

export default EmptyNotifications;