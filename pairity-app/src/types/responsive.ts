export enum DeviceSize {
  SMALL_PHONE = 'small_phone',
  STANDARD_PHONE = 'standard_phone',
  LARGE_PHONE = 'large_phone',
  SMALL_TABLET = 'small_tablet',
  LARGE_TABLET = 'large_tablet',
}

export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum ScreenDensity {
  MDPI = 'mdpi',
  HDPI = 'hdpi',
  XHDPI = 'xhdpi',
  XXHDPI = 'xxhdpi',
  XXXHDPI = 'xxxhdpi',
}

export interface DeviceInfo {
  deviceSize: DeviceSize;
  orientation: Orientation;
  screenDensity: ScreenDensity;
  width: number;
  height: number;
  diagonal: number;
  isTablet: boolean;
  isPhone: boolean;
  pixelRatio: number;
  fontScale: number;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  statusBarHeight: number;
  navigationBarHeight: number;
  platform: 'ios' | 'android';
}

export interface ResponsiveValue<T> {
  smallPhone?: T;
  standardPhone?: T;
  largePhone?: T;
  smallTablet?: T;
  largeTablet?: T;
  landscape?: T;
  portrait?: T;
  default: T;
}

export interface Breakpoints {
  smallPhone: number;
  standardPhone: number;
  largePhone: number;
  smallTablet: number;
  largeTablet: number;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Typography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  body: TextStyle;
  bodyLarge: TextStyle;
  bodySmall: TextStyle;
  caption: TextStyle;
  button: TextStyle;
  link: TextStyle;
}

export interface TextStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight?: string;
  letterSpacing?: number;
  fontFamily?: string;
}

export interface TouchTarget {
  minWidth: number;
  minHeight: number;
  padding: number;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface AdaptiveLayoutConfig {
  columns: ResponsiveValue<number>;
  gap: ResponsiveValue<number>;
  padding: ResponsiveValue<number>;
  margin: ResponsiveValue<number>;
}

export interface ImageSizes {
  thumbnail: { width: number; height: number };
  card: { width: number; height: number };
  profile: { width: number; height: number };
  full: { width: number; height: number };
}

export interface NavigationLayout {
  type: 'bottom' | 'top' | 'sidebar' | 'drawer';
  position: 'fixed' | 'absolute' | 'relative';
  height?: number;
  width?: number;
}

export interface FormLayout {
  columns: number;
  fieldSpacing: number;
  labelPosition: 'top' | 'left' | 'floating';
  submitButtonPosition: 'bottom' | 'right' | 'inline';
}

export interface GridConfig {
  columns: number;
  rows?: number;
  gap: number;
  aspectRatio?: number;
  itemHeight?: number;
}

export interface ResponsiveConfig {
  device: DeviceInfo;
  breakpoints: Breakpoints;
  spacing: Spacing;
  typography: Typography;
  touchTargets: TouchTarget;
  safeAreaInsets: SafeAreaInsets;
  navigationLayout: NavigationLayout;
  formLayout: FormLayout;
  gridConfig: GridConfig;
  imageSizes: ImageSizes;
}

export interface ThumbZone {
  easy: { top: number; bottom: number; left: number; right: number };
  medium: { top: number; bottom: number; left: number; right: number };
  hard: { top: number; bottom: number; left: number; right: number };
}

export interface PerformanceConfig {
  enableAnimations: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  loadingStrategy: 'lazy' | 'eager' | 'progressive';
  cacheImages: boolean;
  reducedMotion: boolean;
}

export interface AccessibilityConfig {
  minimumTouchTargetSize: number;
  fontScaleMultiplier: number;
  highContrast: boolean;
  reduceTransparency: boolean;
  screenReaderEnabled: boolean;
  prefersCrossFadeTransitions: boolean;
}