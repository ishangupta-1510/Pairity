import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
} from 'react-native';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { InAppNotificationBanner } from '@/types/notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NotificationBannerProps {
  notification: InAppNotificationBanner;
  onPress?: () => void;
  onDismiss?: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onPress,
  onDismiss,
}) => {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getBannerStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          iconName: 'check-circle',
          iconColor: 'white',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          iconName: 'error',
          iconColor: 'white',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          iconName: 'warning',
          iconColor: 'white',
        };
      case 'info':
        return {
          backgroundColor: '#2196F3',
          iconName: 'info',
          iconColor: 'white',
        };
      case 'match':
        return {
          backgroundColor: theme.colors.premium,
          iconName: 'favorite',
          iconColor: 'white',
        };
      case 'message':
        return {
          backgroundColor: theme.colors.primary,
          iconName: 'chat',
          iconColor: 'white',
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          iconName: 'notifications',
          iconColor: theme.colors.text,
        };
    }
  };

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      notification.onDismiss?.();
      onDismiss?.();
    });
  };

  const handlePress = () => {
    notification.onPress?.();
    onPress?.();
    handleDismiss();
  };

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY } = event.nativeEvent;
    
    // Allow horizontal swipe to dismiss
    translateX.setValue(translationX);
    
    // Allow upward swipe to dismiss
    if (translationY < 0) {
      translateY.setValue(translationY);
    }
  };

  const handleGestureStateChange = (event: any) => {
    const { translationX, translationY, state } = event.nativeEvent;

    if (state === State.END) {
      if (Math.abs(translationX) > SCREEN_WIDTH * 0.3 || translationY < -50) {
        // Dismiss if swiped far enough
        handleDismiss();
      } else {
        // Return to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const bannerStyles = getBannerStyles();

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleGestureStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: bannerStyles.backgroundColor,
            transform: [{ translateY }, { translateX }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          {/* Avatar or Icon */}
          <View style={styles.iconContainer}>
            {notification.avatar ? (
              <Image source={{ uri: notification.avatar }} style={styles.avatar} />
            ) : (
              <Icon
                name={bannerStyles.iconName}
                size={24}
                color={bannerStyles.iconColor}
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <View style={styles.actionsContainer}>
              {notification.actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionButton,
                    action.style === 'destructive' && styles.destructiveAction,
                  ]}
                  onPress={() => {
                    action.onPress();
                    handleDismiss();
                  }}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.style === 'destructive' && styles.destructiveActionText,
                    ]}
                  >
                    {action.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Dismiss button */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={20} color={bannerStyles.iconColor} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Special effects for match notifications */}
        {notification.type === 'match' && (
          <View style={styles.matchEffects}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.heart}>💕</Text>
            <Text style={styles.sparkle}>✨</Text>
          </View>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 70,
  },
  iconContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  destructiveAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#FF5252',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  destructiveActionText: {
    color: '#FF5252',
  },
  dismissButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  matchEffects: {
    position: 'absolute',
    top: -5,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  sparkle: {
    fontSize: 16,
    opacity: 0.8,
  },
  heart: {
    fontSize: 18,
  },
});

export default NotificationBanner;