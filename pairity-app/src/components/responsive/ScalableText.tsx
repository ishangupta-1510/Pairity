import React from 'react';
import {
  Text,
  TextProps,
  TextStyle,
  Platform,
  AccessibilityProps,
} from 'react-native';
import { useTypography, useFontScale, useDeviceInfo } from '@/hooks/useResponsive';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface ScalableTextProps extends TextProps, AccessibilityProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'button' | 'link';
  color?: string;
  size?: number;
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  selectable?: boolean;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  maxFontSizeMultiplier?: number;
  responsive?: boolean;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

const ScalableText: React.FC<ScalableTextProps> = ({
  variant = 'body',
  color,
  size,
  weight,
  align,
  lineHeight,
  letterSpacing,
  italic = false,
  underline = false,
  uppercase = false,
  lowercase = false,
  capitalize = false,
  selectable = false,
  adjustsFontSizeToFit = false,
  minimumFontScale = 0.5,
  maxFontSizeMultiplier,
  responsive = true,
  style,
  children,
  numberOfLines,
  ellipsizeMode,
  ...accessibilityProps
}) => {
  const theme = useTheme();
  const typography = useTypography();
  const { fontScale, scaleFontSize } = useFontScale();
  const deviceInfo = useDeviceInfo();

  // Get base styles from typography variant
  const getVariantStyles = (): TextStyle => {
    const variantStyle = typography[variant];
    
    if (!responsive) {
      return variantStyle;
    }

    // Apply responsive scaling
    const scaledStyle: TextStyle = {
      ...variantStyle,
      fontSize: size || scaleFontSize(variantStyle.fontSize),
      lineHeight: lineHeight || scaleFontSize(variantStyle.lineHeight),
    };

    // Adjust for device type
    if (deviceInfo.isTablet) {
      scaledStyle.fontSize = (scaledStyle.fontSize || 16) * 1.1;
      scaledStyle.lineHeight = (scaledStyle.lineHeight || 24) * 1.1;
    } else if (deviceInfo.deviceSize === 'small_phone') {
      scaledStyle.fontSize = (scaledStyle.fontSize || 16) * 0.9;
      scaledStyle.lineHeight = (scaledStyle.lineHeight || 24) * 0.9;
    }

    return scaledStyle;
  };

  // Calculate final text style
  const textStyle: TextStyle = {
    ...getVariantStyles(),
    color: color || theme.colors.text,
    fontWeight: weight || getVariantStyles().fontWeight,
    textAlign: align,
    letterSpacing: letterSpacing || getVariantStyles().letterSpacing,
    fontStyle: italic ? 'italic' : 'normal',
    textDecorationLine: underline ? 'underline' : 'none',
    textTransform: uppercase ? 'uppercase' : lowercase ? 'lowercase' : capitalize ? 'capitalize' : 'none',
  };

  // Handle custom size override
  if (size) {
    textStyle.fontSize = responsive ? scaleFontSize(size) : size;
  }

  // Handle custom line height
  if (lineHeight) {
    textStyle.lineHeight = responsive ? scaleFontSize(lineHeight) : lineHeight;
  }

  // Platform-specific adjustments
  if (Platform.OS === 'ios') {
    // iOS-specific font adjustments
    if (variant === 'h1' || variant === 'h2') {
      textStyle.fontFamily = 'System';
    }
  } else if (Platform.OS === 'android') {
    // Android-specific font adjustments
    if (variant === 'button') {
      textStyle.textTransform = textStyle.textTransform || 'uppercase';
    }
  }

  // Calculate max font size multiplier based on accessibility settings
  const calculateMaxMultiplier = () => {
    if (maxFontSizeMultiplier) return maxFontSizeMultiplier;
    
    // Limit font scaling for headers to prevent layout issues
    if (variant === 'h1' || variant === 'h2') return 1.5;
    if (variant === 'h3' || variant === 'h4') return 1.75;
    
    // Allow more scaling for body text
    return 2.0;
  };

  return (
    <Text
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      selectable={selectable}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      maxFontSizeMultiplier={calculateMaxMultiplier()}
      allowFontScaling={responsive}
      {...accessibilityProps}
    >
      {children}
    </Text>
  );
};

export default ScalableText;