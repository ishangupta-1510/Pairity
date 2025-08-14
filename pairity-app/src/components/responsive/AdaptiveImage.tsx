import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageSourcePropType,
  ViewStyle,
  ImageStyle,
  PixelRatio,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { BlurView } from 'expo-blur';
import { useImageSizes, useDeviceInfo, useSimplifiedLayout } from '@/hooks/useResponsive';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface AdaptiveImageProps {
  source: string | ImageSourcePropType;
  variant?: 'thumbnail' | 'card' | 'profile' | 'full' | 'custom';
  width?: number;
  height?: number;
  aspectRatio?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  placeholder?: string;
  progressive?: boolean;
  priority?: 'low' | 'normal' | 'high';
  onLoad?: () => void;
  onError?: () => void;
  style?: ViewStyle | ImageStyle;
  containerStyle?: ViewStyle;
  blurRadius?: number;
  useFastImage?: boolean;
  accessibilityLabel?: string;
  cacheControl?: 'immutable' | 'web' | 'cacheOnly';
}

const AdaptiveImage: React.FC<AdaptiveImageProps> = ({
  source,
  variant = 'card',
  width,
  height,
  aspectRatio,
  resizeMode = 'cover',
  placeholder,
  progressive = true,
  priority = 'normal',
  onLoad,
  onError,
  style,
  containerStyle,
  blurRadius = 0,
  useFastImage = true,
  accessibilityLabel,
  cacheControl = 'immutable',
}) => {
  const theme = useTheme();
  const imageSizes = useImageSizes();
  const deviceInfo = useDeviceInfo();
  const useSimplified = useSimplifiedLayout();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get image dimensions based on variant
  const getImageDimensions = () => {
    if (width && height) {
      return { width, height };
    }
    
    if (variant === 'custom' && width) {
      return { width, height: aspectRatio ? width / aspectRatio : width };
    }

    const sizes = imageSizes[variant];
    if (sizes) {
      return sizes;
    }

    return { width: moderateScale(300), height: moderateScale(300) };
  };

  const dimensions = getImageDimensions();

  // Calculate optimal image resolution based on device
  const getOptimalSource = () => {
    if (typeof source !== 'string') return source;

    const pixelRatio = PixelRatio.get();
    const optimalWidth = Math.ceil(dimensions.width * pixelRatio);
    
    // For simplified layout, use lower resolution
    if (useSimplified) {
      return {
        uri: source,
        priority: FastImage.priority.low,
        cache: FastImage.cacheControl[cacheControl],
      };
    }

    // Add size parameters to URL if it's a remote image
    if (source.startsWith('http')) {
      const separator = source.includes('?') ? '&' : '?';
      const sizedUrl = `${source}${separator}w=${optimalWidth}&q=${deviceInfo.isTablet ? 90 : 80}`;
      
      return {
        uri: sizedUrl,
        priority: priority === 'high' 
          ? FastImage.priority.high 
          : priority === 'low' 
            ? FastImage.priority.low 
            : FastImage.priority.normal,
        cache: FastImage.cacheControl[cacheControl],
      };
    }

    return { uri: source };
  };

  const handleLoad = () => {
    setLoading(false);
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const imageStyle: ImageStyle = {
    width: dimensions.width,
    height: dimensions.height,
    ...style,
  };

  const containerStyles: ViewStyle = {
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: loading ? theme.colors.surface : undefined,
    ...containerStyle,
  };

  // Use native Image for local images or when FastImage is disabled
  const shouldUseNativeImage = !useFastImage || 
    (typeof source !== 'string') || 
    Platform.OS === 'web';

  const renderImage = () => {
    if (error && placeholder) {
      return (
        <Image
          source={{ uri: placeholder }}
          style={imageStyle}
          resizeMode={resizeMode}
        />
      );
    }

    if (shouldUseNativeImage) {
      return (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={imageStyle}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          blurRadius={blurRadius}
          progressiveRenderingEnabled={progressive}
          accessibilityLabel={accessibilityLabel}
        />
      );
    }

    return (
      <FastImage
        source={getOptimalSource()}
        style={imageStyle}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoad={handleLoad}
        onError={handleError}
        accessibilityLabel={accessibilityLabel}
      />
    );
  };

  return (
    <View style={containerStyles}>
      {progressive && loading && placeholder && (
        <Image
          source={{ uri: placeholder }}
          style={[imageStyle, styles.placeholder]}
          resizeMode={resizeMode}
          blurRadius={20}
        />
      )}
      
      {renderImage()}
      
      {loading && (
        <View style={[styles.loadingContainer, dimensions]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      
      {progressive && imageLoaded && blurRadius > 0 && Platform.OS !== 'web' && (
        <BlurView
          intensity={blurRadius}
          style={[StyleSheet.absoluteFillObject, { borderRadius: style?.borderRadius || 0 }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

export default AdaptiveImage;