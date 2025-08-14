import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = [styles.button, styles[size]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }

    return StyleSheet.flatten([baseStyle, style]);
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = [styles.text, styles[`${size}Text`]];

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostText);
        break;
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabledText);
    }

    return StyleSheet.flatten([baseStyle, textStyle]);
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : '#FF6B6B'}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: '#FF6B6B',
  },
  secondary: {
    backgroundColor: '#f0f0f0',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#FF6B6B',
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Variant text colors
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#333',
  },
  outlineText: {
    color: '#FF6B6B',
  },
  ghostText: {
    color: '#FF6B6B',
  },

  // Disabled states
  disabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  },
});

export default CustomButton;