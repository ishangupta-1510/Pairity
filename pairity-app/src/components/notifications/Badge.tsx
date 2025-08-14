import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface BadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
  style?: any;
  showZero?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  count,
  maxCount = 99,
  size = 'medium',
  color,
  textColor,
  style,
  showZero = false,
}) => {
  const theme = useTheme();

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const sizeStyles = {
    small: {
      minWidth: 14,
      height: 14,
      borderRadius: 7,
      paddingHorizontal: 4,
    },
    medium: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
    },
    large: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 6,
    },
  };

  const textSizeStyles = {
    small: { fontSize: 10 },
    medium: { fontSize: 11 },
    large: { fontSize: 12 },
  };

  return (
    <View
      style={[
        styles.badge,
        sizeStyles[size],
        {
          backgroundColor: color || theme.colors.primary,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          textSizeStyles[size],
          {
            color: textColor || 'white',
          },
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;