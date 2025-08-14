import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Image,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeviceInfo, useResponsiveBorderRadius, useResponsiveSpacing } from '@/hooks/useResponsive';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface AdaptiveCardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  imageUri?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'expanded';
  aspectRatio?: number;
  style?: ViewStyle;
  disabled?: boolean;
  showGradient?: boolean;
}

const AdaptiveCard: React.FC<AdaptiveCardProps> = ({
  children,
  onPress,
  imageUri,
  title,
  subtitle,
  variant = 'default',
  aspectRatio,
  style,
  disabled = false,
  showGradient = false,
}) => {
  const theme = useTheme();
  const deviceInfo = useDeviceInfo();
  const borderRadius = useResponsiveBorderRadius(12);
  const padding = useResponsiveSpacing(12);

  const getCardHeight = () => {
    switch (variant) {
      case 'compact':
        return deviceInfo.isTablet ? moderateScale(120) : moderateScale(80);
      case 'expanded':
        return deviceInfo.isTablet ? moderateScale(300) : moderateScale(200);
      default:
        return deviceInfo.isTablet ? moderateScale(200) : moderateScale(150);
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius,
    padding: variant === 'compact' ? padding / 2 : padding,
    minHeight: getCardHeight(),
    aspectRatio,
    ...style,
  };

  const content = (
    <>
      {imageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              {
                borderRadius: borderRadius - 2,
                height: variant === 'compact' ? moderateScale(60) : moderateScale(120),
              },
            ]}
            resizeMode="cover"
          />
          {showGradient && (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={[styles.gradient, { borderRadius: borderRadius - 2 }]}
            />
          )}
        </View>
      )}
      
      {(title || subtitle) && (
        <View style={styles.textContainer}>
          {title && (
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontSize: variant === 'compact' 
                    ? moderateScale(14) 
                    : moderateScale(16),
                },
              ]}
              numberOfLines={variant === 'compact' ? 1 : 2}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: variant === 'compact' 
                    ? moderateScale(12) 
                    : moderateScale(14),
                },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, cardStyle, styles.shadow]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, cardStyle, styles.shadow]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: moderateScale(8),
  },
  image: {
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  textContainer: {
    marginTop: moderateScale(8),
  },
  title: {
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  subtitle: {
    fontWeight: '400',
  },
});

export default AdaptiveCard;