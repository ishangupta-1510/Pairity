import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { useAccessibility } from '@/hooks/useAccessibility';
import { AccessibleButtonProps } from '@/types/accessibility';
import { moderateScale } from '@/utils/responsive';

interface AccessibleButtonComponentProps extends AccessibleButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
}

const AccessibleButton: React.FC<AccessibleButtonComponentProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  pressed = false,
  selected = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  testID,
  style,
  ...props
}) => {
  const theme = useTheme();
  const { 
    settings, 
    getAccessibleFontSize, 
    shouldReduceMotion,
    announceSuccess,
  } = useAccessibility();

  const handlePress = () => {
    if (disabled || loading) return;
    
    onPress();
    
    // Announce action completion if needed
    if (variant === 'primary' && title) {
      announceSuccess(`${title} activated`);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: moderateScale(8),
      paddingVertical: getSizeStyle().paddingVertical,
      paddingHorizontal: getSizeStyle().paddingHorizontal,
      minHeight: getMinHeight(),
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.6 : 1,
    };

    const variantStyles = getVariantStyles();
    
    return [
      baseStyle,
      variantStyles,
      selected && styles.selected,
      pressed && styles.pressed,
      style,
    ];
  };

  const getVariantStyles = () => {
    const { colors } = theme;
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          elevation: Platform.OS === 'android' ? 2 : 0,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          elevation: Platform.OS === 'android' ? 1 : 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
          elevation: Platform.OS === 'android' ? 2 : 0,
        };
      default:
        return {};
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: moderateScale(8),
          paddingHorizontal: moderateScale(12),
        };
      case 'large':
        return {
          paddingVertical: moderateScale(16),
          paddingHorizontal: moderateScale(24),
        };
      default:
        return {
          paddingVertical: moderateScale(12),
          paddingHorizontal: moderateScale(16),
        };
    }
  };

  const getMinHeight = () => {
    // Ensure minimum touch target size
    const minTouchTarget = Platform.OS === 'ios' ? 44 : 48;
    
    switch (size) {
      case 'small':
        return Math.max(minTouchTarget * 0.8, 36);
      case 'large':
        return Math.max(minTouchTarget * 1.2, 52);
      default:
        return minTouchTarget;
    }
  };

  const getTextColor = () => {
    const { colors } = theme;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'text':
        return variant === 'outline' ? colors.primary : colors.text;
      default:
        return colors.text;
    }
  };

  const getTextStyle = () => {
    const fontSize = getFontSize();
    
    return {
      color: getTextColor(),
      fontSize,
      fontWeight: settings.isBoldTextEnabled ? '700' : '600',
      textAlign: 'center' as const,
      marginLeft: icon && iconPosition === 'left' ? moderateScale(8) : 0,
      marginRight: icon && iconPosition === 'right' ? moderateScale(8) : 0,
    };
  };

  const getFontSize = () => {
    const baseSizes = {
      small: 14,
      medium: 16,
      large: 18,
    };
    
    return getAccessibleFontSize(moderateScale(baseSizes[size]));
  };

  const getIconSize = () => {
    const baseSizes = {
      small: 16,
      medium: 20,
      large: 24,
    };
    
    return moderateScale(baseSizes[size]);
  };

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    
    let label = title || 'Button';
    if (loading) label = `Loading, ${label}`;
    if (selected) label = `Selected, ${label}`;
    
    return label;
  };

  const getAccessibilityHint = () => {
    if (accessibilityHint) return accessibilityHint;
    if (disabled) return 'Button is disabled';
    if (loading) return 'Please wait, action in progress';
    return 'Double tap to activate';
  };

  const getAccessibilityState = () => {
    return {
      disabled: disabled || loading,
      selected,
      busy: loading,
      ...accessibilityState,
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()}
          importantForAccessibility="no-hide-descendants"
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <Icon 
            name={icon} 
            size={getIconSize()} 
            color={getTextColor()}
            importantForAccessibility="no-hide-descendants"
          />
        )}
        
        {title && (
          <Text 
            style={getTextStyle()}
            numberOfLines={1}
            importantForAccessibility="no-hide-descendants"
          >
            {title}
          </Text>
        )}
        
        {icon && iconPosition === 'right' && (
          <Icon 
            name={icon} 
            size={getIconSize()} 
            color={getTextColor()}
            importantForAccessibility="no-hide-descendants"
          />
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={shouldReduceMotion() ? 1 : 0.7}
      // Accessibility props
      accessible={true}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={getAccessibilityHint()}
      accessibilityRole={accessibilityRole}
      accessibilityState={getAccessibilityState()}
      testID={testID}
      // Platform-specific props
      {...(Platform.OS === 'android' && {
        accessibilityComponentType: 'button',
      })}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selected: {
    borderWidth: 2,
    borderColor: '#007AFF', // iOS selection color
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});

export default AccessibleButton;