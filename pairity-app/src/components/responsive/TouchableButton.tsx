import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTouchTargets, useResponsiveBorderRadius, useTypography } from '@/hooks/useResponsive';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';
import Haptics from 'expo-haptics';

interface TouchableButtonProps {
  onPress: () => void;
  onLongPress?: () => void;
  title?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const TouchableButton: React.FC<TouchableButtonProps> = ({
  onPress,
  onLongPress,
  title,
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme();
  const touchTargets = useTouchTargets();
  const borderRadius = useResponsiveBorderRadius(8);
  const typography = useTypography();

  const handlePress = () => {
    if (hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handleLongPress = () => {
    if (onLongPress) {
      if (hapticFeedback && Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onLongPress();
    }
  };

  const getSizeStyles = (): ViewStyle => {
    const sizes = {
      small: {
        minHeight: Math.max(touchTargets.minHeight * 0.8, 36),
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(6),
      },
      medium: {
        minHeight: touchTargets.minHeight,
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(10),
      },
      large: {
        minHeight: Math.max(touchTargets.minHeight * 1.2, 52),
        paddingHorizontal: moderateScale(20),
        paddingVertical: moderateScale(14),
      },
      xlarge: {
        minHeight: Math.max(touchTargets.minHeight * 1.4, 60),
        paddingHorizontal: moderateScale(24),
        paddingVertical: moderateScale(16),
      },
    };
    return sizes[size];
  };

  const getVariantStyles = (): ViewStyle => {
    const variants = {
      primary: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      gradient: {
        backgroundColor: 'transparent',
      },
    };
    return variants[variant];
  };

  const getTextColor = (): string => {
    if (disabled) return theme.colors.textDisabled;
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getFontSize = (): number => {
    const sizes = {
      small: moderateScale(14),
      medium: moderateScale(16),
      large: moderateScale(18),
      xlarge: moderateScale(20),
    };
    return sizes[size];
  };

  const buttonStyle: ViewStyle = {
    borderRadius,
    minWidth: touchTargets.minWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.6 : 1,
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  const buttonTextStyle: TextStyle = {
    fontSize: getFontSize(),
    fontWeight: '600',
    color: getTextColor(),
    marginLeft: icon ? moderateScale(8) : 0,
    ...textStyle,
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && !loading && (
            <Icon name={icon} size={getFontSize() + 2} color={getTextColor()} />
          )}
          {title && (
            <Text style={buttonTextStyle} numberOfLines={1}>
              {title}
            </Text>
          )}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[styles.touchable, { width: fullWidth ? '100%' : undefined }]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        <LinearGradient
          colors={disabled 
            ? [theme.colors.disabled, theme.colors.disabled]
            : [theme.colors.primary, theme.colors.primaryLight]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[buttonStyle, styles.gradient]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.touchable, buttonStyle]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    overflow: 'hidden',
  },
  gradient: {
    overflow: 'hidden',
  },
});

export default TouchableButton;