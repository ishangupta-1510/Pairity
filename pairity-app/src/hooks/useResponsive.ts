import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  DeviceInfo,
  ResponsiveValue,
  ResponsiveConfig,
  NavigationLayout,
  FormLayout,
  GridConfig,
  ImageSizes,
  ThumbZone,
  Spacing,
  Typography,
  TouchTarget,
} from '@/types/responsive';
import {
  getDeviceInfo,
  selectResponsiveValue,
  getSpacing,
  getTypography,
  getTouchTargets,
  getNavigationLayout,
  getFormLayout,
  getGridConfig,
  getImageSizes,
  getThumbZones,
  getAdaptivePadding,
  getSafeContentWidth,
  getColumnWidth,
  shouldUseSimplifiedLayout,
  getOptimalColumns,
  scale,
  verticalScale,
  moderateScale,
} from '@/utils/responsive';

// Hook to get current device info and listen to orientation changes
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo());

  useEffect(() => {
    const updateDeviceInfo = ({ window }: { window: ScaledSize }) => {
      setDeviceInfo(getDeviceInfo());
    };

    const subscription = Dimensions.addEventListener('change', updateDeviceInfo);

    return () => {
      subscription?.remove();
    };
  }, []);

  return deviceInfo;
};

// Hook to get responsive value based on device
export const useResponsiveValue = <T>(values: ResponsiveValue<T>): T => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => selectResponsiveValue(values, deviceInfo),
    [values, deviceInfo]
  );
};

// Hook to get complete responsive configuration
export const useResponsiveConfig = (): ResponsiveConfig => {
  const deviceInfo = useDeviceInfo();
  
  return useMemo(() => ({
    device: deviceInfo,
    breakpoints: {
      smallPhone: 320,
      standardPhone: 375,
      largePhone: 414,
      smallTablet: 600,
      largeTablet: 768,
    },
    spacing: getSpacing(),
    typography: getTypography(deviceInfo.fontScale),
    touchTargets: getTouchTargets(),
    safeAreaInsets: {
      top: deviceInfo.statusBarHeight,
      bottom: deviceInfo.navigationBarHeight,
      left: 0,
      right: 0,
    },
    navigationLayout: getNavigationLayout(deviceInfo),
    formLayout: getFormLayout(deviceInfo),
    gridConfig: getGridConfig(deviceInfo),
    imageSizes: getImageSizes(deviceInfo),
  }), [deviceInfo]);
};

// Hook for responsive spacing
export const useSpacing = (): Spacing => {
  return useMemo(() => getSpacing(), []);
};

// Hook for responsive typography
export const useTypography = (): Typography => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getTypography(deviceInfo.fontScale),
    [deviceInfo.fontScale]
  );
};

// Hook for navigation layout
export const useNavigationLayout = (): NavigationLayout => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getNavigationLayout(deviceInfo),
    [deviceInfo]
  );
};

// Hook for form layout
export const useFormLayout = (): FormLayout => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getFormLayout(deviceInfo),
    [deviceInfo]
  );
};

// Hook for grid configuration
export const useGridConfig = (
  customConfig?: Partial<GridConfig>
): GridConfig => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => ({ ...getGridConfig(deviceInfo), ...customConfig }),
    [deviceInfo, customConfig]
  );
};

// Hook for image sizes
export const useImageSizes = (): ImageSizes => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getImageSizes(deviceInfo),
    [deviceInfo]
  );
};

// Hook for thumb zones
export const useThumbZones = (): ThumbZone => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getThumbZones(deviceInfo),
    [deviceInfo]
  );
};

// Hook for adaptive padding
export const useAdaptivePadding = (): number => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getAdaptivePadding(deviceInfo),
    [deviceInfo]
  );
};

// Hook for safe content width
export const useSafeContentWidth = (): number => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getSafeContentWidth(deviceInfo),
    [deviceInfo]
  );
};

// Hook for column width calculation
export const useColumnWidth = (
  columns: number,
  gap: number = 0,
  containerWidth?: number
): number => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getColumnWidth(columns, gap, containerWidth),
    [columns, gap, containerWidth, deviceInfo]
  );
};

// Hook to check if simplified layout should be used
export const useSimplifiedLayout = (): boolean => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => shouldUseSimplifiedLayout(deviceInfo),
    [deviceInfo]
  );
};

// Hook to get optimal columns for a grid
export const useOptimalColumns = (
  itemWidth: number,
  maxColumns: number = 5
): number => {
  const deviceInfo = useDeviceInfo();
  return useMemo(
    () => getOptimalColumns(itemWidth, deviceInfo, maxColumns),
    [itemWidth, deviceInfo, maxColumns]
  );
};

// Hook for responsive dimensions
export const useDimensions = () => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const updateDimensions = ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);

    return () => {
      subscription?.remove();
    };
  }, []);

  return dimensions;
};

// Hook for scaling utilities
export const useScaling = () => {
  return useMemo(() => ({
    scale,
    verticalScale,
    moderateScale,
  }), []);
};

// Hook to detect if device is in landscape
export const useIsLandscape = (): boolean => {
  const { width, height } = useDimensions();
  return width > height;
};

// Hook to detect if device is a tablet
export const useIsTablet = (): boolean => {
  const deviceInfo = useDeviceInfo();
  return deviceInfo.isTablet;
};

// Hook for touch target sizes
export const useTouchTargets = (): TouchTarget => {
  return useMemo(() => getTouchTargets(), []);
};

// Hook for responsive styles
export const useResponsiveStyles = <T extends Record<string, any>>(
  stylesFn: (config: ResponsiveConfig) => T
): T => {
  const config = useResponsiveConfig();
  return useMemo(() => stylesFn(config), [config, stylesFn]);
};

// Hook for media query-like functionality
export const useMediaQuery = (query: {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  orientation?: 'portrait' | 'landscape';
  deviceType?: 'phone' | 'tablet';
}): boolean => {
  const deviceInfo = useDeviceInfo();
  const { width, height } = useDimensions();

  return useMemo(() => {
    if (query.minWidth && width < query.minWidth) return false;
    if (query.maxWidth && width > query.maxWidth) return false;
    if (query.minHeight && height < query.minHeight) return false;
    if (query.maxHeight && height > query.maxHeight) return false;
    if (query.orientation && deviceInfo.orientation !== query.orientation) return false;
    if (query.deviceType) {
      if (query.deviceType === 'phone' && !deviceInfo.isPhone) return false;
      if (query.deviceType === 'tablet' && !deviceInfo.isTablet) return false;
    }
    return true;
  }, [deviceInfo, width, height, query]);
};

// Hook for responsive font scaling
export const useFontScale = () => {
  const deviceInfo = useDeviceInfo();
  
  const scaleFontSize = useCallback((size: number) => {
    return moderateScale(size) * deviceInfo.fontScale;
  }, [deviceInfo.fontScale]);

  return { fontScale: deviceInfo.fontScale, scaleFontSize };
};

// Hook for responsive margin/padding
export const useResponsiveSpacing = (
  baseValue: number,
  scaleFactor: number = 1
): number => {
  const deviceInfo = useDeviceInfo();
  
  return useMemo(() => {
    const scaled = moderateScale(baseValue, scaleFactor);
    
    // Apply additional scaling for tablets
    if (deviceInfo.isTablet) {
      return scaled * 1.2;
    }
    
    // Apply reduction for small phones
    if (deviceInfo.deviceSize === 'small_phone') {
      return scaled * 0.85;
    }
    
    return scaled;
  }, [baseValue, scaleFactor, deviceInfo]);
};

// Hook for responsive border radius
export const useResponsiveBorderRadius = (
  baseRadius: number
): number => {
  const deviceInfo = useDeviceInfo();
  
  return useMemo(() => {
    // Scale border radius based on device size
    return moderateScale(baseRadius, 0.3);
  }, [baseRadius, deviceInfo]);
};