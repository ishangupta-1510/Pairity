import { Dimensions, PixelRatio, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  DeviceSize,
  Orientation,
  ScreenDensity,
  DeviceInfo as DeviceInfoType,
  ResponsiveValue,
  Breakpoints,
  Spacing,
  Typography,
  TouchTarget,
  ImageSizes,
  NavigationLayout,
  FormLayout,
  GridConfig,
  ThumbZone,
} from '@/types/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for different device sizes (in inches)
export const DEVICE_BREAKPOINTS = {
  smallPhone: 5.5,
  standardPhone: 6.5,
  largePhone: 7.0,
  smallTablet: 9.0,
  largeTablet: 11.0,
};

// Calculate diagonal screen size in inches
export const getScreenDiagonal = (width: number, height: number): number => {
  const pixelRatio = PixelRatio.get();
  const widthInches = width / (pixelRatio * 160);
  const heightInches = height / (pixelRatio * 160);
  return Math.sqrt(widthInches * widthInches + heightInches * heightInches);
};

// Get device size category
export const getDeviceSize = (diagonal: number): DeviceSize => {
  if (diagonal < DEVICE_BREAKPOINTS.smallPhone) return DeviceSize.SMALL_PHONE;
  if (diagonal < DEVICE_BREAKPOINTS.standardPhone) return DeviceSize.STANDARD_PHONE;
  if (diagonal < DEVICE_BREAKPOINTS.largePhone) return DeviceSize.LARGE_PHONE;
  if (diagonal < DEVICE_BREAKPOINTS.smallTablet) return DeviceSize.SMALL_TABLET;
  return DeviceSize.LARGE_TABLET;
};

// Get screen density
export const getScreenDensity = (): ScreenDensity => {
  const ratio = PixelRatio.get();
  if (ratio <= 1) return ScreenDensity.MDPI;
  if (ratio <= 1.5) return ScreenDensity.HDPI;
  if (ratio <= 2) return ScreenDensity.XHDPI;
  if (ratio <= 3) return ScreenDensity.XXHDPI;
  return ScreenDensity.XXXHDPI;
};

// Get current orientation
export const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
};

// Get device information
export const getDeviceInfo = (): DeviceInfoType => {
  const { width, height } = Dimensions.get('window');
  const diagonal = getScreenDiagonal(width, height);
  const deviceSize = getDeviceSize(diagonal);
  
  return {
    deviceSize,
    orientation: getOrientation(width, height),
    screenDensity: getScreenDensity(),
    width,
    height,
    diagonal,
    isTablet: deviceSize === DeviceSize.SMALL_TABLET || deviceSize === DeviceSize.LARGE_TABLET,
    isPhone: deviceSize === DeviceSize.SMALL_PHONE || deviceSize === DeviceSize.STANDARD_PHONE || deviceSize === DeviceSize.LARGE_PHONE,
    pixelRatio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
    hasNotch: DeviceInfo.hasNotch(),
    hasDynamicIsland: DeviceInfo.hasDynamicIsland && DeviceInfo.hasDynamicIsland(),
    statusBarHeight: Platform.OS === 'ios' ? (DeviceInfo.hasNotch() ? 44 : 20) : 0,
    navigationBarHeight: Platform.OS === 'ios' ? (DeviceInfo.hasNotch() ? 34 : 0) : 0,
    platform: Platform.OS as 'ios' | 'android',
  };
};

// Select value based on device size
export const selectResponsiveValue = <T>(
  values: ResponsiveValue<T>,
  deviceInfo: DeviceInfoType
): T => {
  const { deviceSize, orientation } = deviceInfo;
  
  // Check orientation-specific values first
  if (orientation === Orientation.LANDSCAPE && values.landscape !== undefined) {
    return values.landscape;
  }
  if (orientation === Orientation.PORTRAIT && values.portrait !== undefined) {
    return values.portrait;
  }
  
  // Then check device-specific values
  switch (deviceSize) {
    case DeviceSize.SMALL_PHONE:
      return values.smallPhone ?? values.default;
    case DeviceSize.STANDARD_PHONE:
      return values.standardPhone ?? values.default;
    case DeviceSize.LARGE_PHONE:
      return values.largePhone ?? values.default;
    case DeviceSize.SMALL_TABLET:
      return values.smallTablet ?? values.default;
    case DeviceSize.LARGE_TABLET:
      return values.largeTablet ?? values.default;
    default:
      return values.default;
  }
};

// Scale value based on screen size
export const scale = (size: number): number => {
  const baseWidth = 375; // iPhone 11 Pro width
  const ratio = SCREEN_WIDTH / baseWidth;
  return Math.round(size * ratio);
};

// Vertical scale
export const verticalScale = (size: number): number => {
  const baseHeight = 812; // iPhone 11 Pro height
  const ratio = SCREEN_HEIGHT / baseHeight;
  return Math.round(size * ratio);
};

// Moderate scale (for fonts and elements that shouldn't scale too much)
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Get responsive spacing
export const getSpacing = (): Spacing => ({
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
});

// Get responsive typography
export const getTypography = (fontScale: number = 1): Typography => ({
  h1: {
    fontSize: moderateScale(32) * fontScale,
    lineHeight: moderateScale(40) * fontScale,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: moderateScale(28) * fontScale,
    lineHeight: moderateScale(36) * fontScale,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: moderateScale(24) * fontScale,
    lineHeight: moderateScale(32) * fontScale,
    fontWeight: '600',
  },
  h4: {
    fontSize: moderateScale(20) * fontScale,
    lineHeight: moderateScale(28) * fontScale,
    fontWeight: '500',
  },
  body: {
    fontSize: moderateScale(16) * fontScale,
    lineHeight: moderateScale(24) * fontScale,
    fontWeight: '400',
  },
  bodyLarge: {
    fontSize: moderateScale(18) * fontScale,
    lineHeight: moderateScale(28) * fontScale,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: moderateScale(14) * fontScale,
    lineHeight: moderateScale(20) * fontScale,
    fontWeight: '400',
  },
  caption: {
    fontSize: moderateScale(12) * fontScale,
    lineHeight: moderateScale(16) * fontScale,
    fontWeight: '400',
  },
  button: {
    fontSize: moderateScale(16) * fontScale,
    lineHeight: moderateScale(24) * fontScale,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  link: {
    fontSize: moderateScale(16) * fontScale,
    lineHeight: moderateScale(24) * fontScale,
    fontWeight: '500',
  },
});

// Get touch target sizes
export const getTouchTargets = (): TouchTarget => ({
  minWidth: Platform.OS === 'ios' ? 44 : 48,
  minHeight: Platform.OS === 'ios' ? 44 : 48,
  padding: moderateScale(12),
});

// Get navigation layout based on device
export const getNavigationLayout = (deviceInfo: DeviceInfoType): NavigationLayout => {
  if (deviceInfo.isTablet) {
    return {
      type: deviceInfo.orientation === Orientation.LANDSCAPE ? 'sidebar' : 'top',
      position: 'fixed',
      width: deviceInfo.orientation === Orientation.LANDSCAPE ? 280 : undefined,
      height: 56,
    };
  }
  
  return {
    type: 'bottom',
    position: 'fixed',
    height: Platform.OS === 'ios' ? 83 : 56,
  };
};

// Get form layout based on device
export const getFormLayout = (deviceInfo: DeviceInfoType): FormLayout => {
  if (deviceInfo.isTablet && deviceInfo.orientation === Orientation.LANDSCAPE) {
    return {
      columns: 2,
      fieldSpacing: moderateScale(16),
      labelPosition: 'left',
      submitButtonPosition: 'right',
    };
  }
  
  return {
    columns: 1,
    fieldSpacing: moderateScale(12),
    labelPosition: 'top',
    submitButtonPosition: 'bottom',
  };
};

// Get grid configuration
export const getGridConfig = (deviceInfo: DeviceInfoType): GridConfig => {
  const configs: Record<DeviceSize, GridConfig> = {
    [DeviceSize.SMALL_PHONE]: {
      columns: 1,
      gap: moderateScale(8),
    },
    [DeviceSize.STANDARD_PHONE]: {
      columns: 2,
      gap: moderateScale(12),
    },
    [DeviceSize.LARGE_PHONE]: {
      columns: 2,
      gap: moderateScale(16),
    },
    [DeviceSize.SMALL_TABLET]: {
      columns: 3,
      gap: moderateScale(16),
    },
    [DeviceSize.LARGE_TABLET]: {
      columns: deviceInfo.orientation === Orientation.LANDSCAPE ? 4 : 3,
      gap: moderateScale(20),
    },
  };
  
  return configs[deviceInfo.deviceSize];
};

// Get image sizes based on device
export const getImageSizes = (deviceInfo: DeviceInfoType): ImageSizes => {
  const baseMultiplier = deviceInfo.isTablet ? 1.5 : 1;
  
  return {
    thumbnail: {
      width: scale(150 * baseMultiplier),
      height: scale(150 * baseMultiplier),
    },
    card: {
      width: scale(300 * baseMultiplier),
      height: scale(400 * baseMultiplier),
    },
    profile: {
      width: scale(600 * baseMultiplier),
      height: scale(800 * baseMultiplier),
    },
    full: {
      width: deviceInfo.width,
      height: deviceInfo.height,
    },
  };
};

// Get thumb zones for one-handed use
export const getThumbZones = (deviceInfo: DeviceInfoType): ThumbZone => {
  const { width, height } = deviceInfo;
  
  if (deviceInfo.isTablet) {
    // Tablets are typically used with two hands
    return {
      easy: { top: height * 0.3, bottom: height * 0.7, left: width * 0.2, right: width * 0.8 },
      medium: { top: height * 0.2, bottom: height * 0.8, left: width * 0.1, right: width * 0.9 },
      hard: { top: 0, bottom: height, left: 0, right: width },
    };
  }
  
  // Phone thumb zones (right-handed assumption, can be mirrored for left-handed)
  return {
    easy: { 
      top: height * 0.5, 
      bottom: height * 0.9, 
      left: width * 0.3, 
      right: width * 0.95 
    },
    medium: { 
      top: height * 0.3, 
      bottom: height * 0.95, 
      left: width * 0.1, 
      right: width 
    },
    hard: { 
      top: 0, 
      bottom: height, 
      left: 0, 
      right: width 
    },
  };
};

// Check if a position is within thumb reach
export const isInThumbReach = (
  x: number, 
  y: number, 
  zone: 'easy' | 'medium' | 'hard',
  thumbZones: ThumbZone
): boolean => {
  const selectedZone = thumbZones[zone];
  return (
    x >= selectedZone.left &&
    x <= selectedZone.right &&
    y >= selectedZone.top &&
    y <= selectedZone.bottom
  );
};

// Calculate adaptive padding
export const getAdaptivePadding = (deviceInfo: DeviceInfoType): number => {
  const basePadding = 16;
  
  if (deviceInfo.isTablet) {
    return moderateScale(basePadding * 2);
  }
  
  switch (deviceInfo.deviceSize) {
    case DeviceSize.SMALL_PHONE:
      return moderateScale(basePadding * 0.75);
    case DeviceSize.LARGE_PHONE:
      return moderateScale(basePadding * 1.25);
    default:
      return moderateScale(basePadding);
  }
};

// Get safe content width (accounting for margins)
export const getSafeContentWidth = (deviceInfo: DeviceInfoType): number => {
  const padding = getAdaptivePadding(deviceInfo);
  return deviceInfo.width - (padding * 2);
};

// Calculate column width for grid layouts
export const getColumnWidth = (
  columns: number,
  gap: number,
  containerWidth?: number
): number => {
  const width = containerWidth || getSafeContentWidth(getDeviceInfo());
  const totalGap = gap * (columns - 1);
  return (width - totalGap) / columns;
};

// Check if should use simplified layout (for performance)
export const shouldUseSimplifiedLayout = (deviceInfo: DeviceInfoType): boolean => {
  // Use simplified layout for small phones or low-end devices
  return deviceInfo.deviceSize === DeviceSize.SMALL_PHONE || 
         deviceInfo.pixelRatio < 2;
};

// Get optimal number of columns for a list
export const getOptimalColumns = (
  itemWidth: number,
  deviceInfo: DeviceInfoType,
  maxColumns: number = 5
): number => {
  const contentWidth = getSafeContentWidth(deviceInfo);
  const columns = Math.floor(contentWidth / itemWidth);
  return Math.min(Math.max(1, columns), maxColumns);
};