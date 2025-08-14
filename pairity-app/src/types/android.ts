export enum AndroidBiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  NONE = 'none',
}

export interface AndroidPermission {
  camera: 'granted' | 'denied' | 'never_ask_again';
  storage: 'granted' | 'denied' | 'never_ask_again';
  microphone: 'granted' | 'denied' | 'never_ask_again';
  location: 'granted' | 'denied' | 'never_ask_again';
  locationBackground: 'granted' | 'denied' | 'never_ask_again';
  contacts: 'granted' | 'denied' | 'never_ask_again';
  phone: 'granted' | 'denied' | 'never_ask_again';
  notifications: 'granted' | 'denied' | 'never_ask_again';
}

export interface AndroidNotificationChannel {
  channelId: string;
  channelName: string;
  channelDescription?: string;
  importance: 'min' | 'low' | 'default' | 'high' | 'max';
  playSound: boolean;
  soundName?: string;
  vibrate: boolean;
  vibrationPattern?: number[];
  showBadge: boolean;
  enableLights: boolean;
  lightColor?: string;
  bypassDnd?: boolean;
  lockscreenVisibility?: 'private' | 'public' | 'secret';
}

export interface AndroidNotification {
  id: string;
  title: string;
  body: string;
  smallIcon?: string;
  largeIcon?: string;
  bigText?: string;
  bigPictureUrl?: string;
  color?: string;
  tag?: string;
  group?: string;
  groupSummary?: boolean;
  channelId: string;
  ticker?: string;
  autoCancel?: boolean;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  visibility?: 'private' | 'public' | 'secret';
  actions?: AndroidNotificationAction[];
  data?: Record<string, any>;
}

export interface AndroidNotificationAction {
  action: string;
  title: string;
  icon?: string;
  showUserInterface?: boolean;
  allowGeneratedReplies?: boolean;
  remoteInputs?: AndroidRemoteInput[];
}

export interface AndroidRemoteInput {
  resultKey: string;
  label: string;
  placeholder?: string;
  allowFreeFormInput?: boolean;
  choices?: string[];
}

export interface AndroidShortcut {
  id: string;
  shortLabel: string;
  longLabel: string;
  icon?: string;
  intent: {
    action: string;
    targetClass?: string;
    categories?: string[];
    data?: string;
    extras?: Record<string, any>;
  };
  rank?: number;
  categories?: string[];
  enabled?: boolean;
  pinned?: boolean;
}

export interface AndroidWidget {
  widgetId: number;
  layoutId: string;
  updatePeriodMillis?: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  resizeMode?: 'none' | 'horizontal' | 'vertical' | 'both';
  previewImage?: string;
  configure?: boolean;
}

export interface AndroidWorkRequest {
  id: string;
  workerClass: string;
  constraints?: {
    networkType?: 'connected' | 'unmetered' | 'not_roaming' | 'metered';
    requiresBatteryNotLow?: boolean;
    requiresCharging?: boolean;
    requiresDeviceIdle?: boolean;
    requiresStorageNotLow?: boolean;
  };
  inputData?: Record<string, any>;
  initialDelay?: number;
  backoffPolicy?: 'linear' | 'exponential';
  backoffDelay?: number;
  periodic?: boolean;
  intervalMs?: number;
  flexIntervalMs?: number;
  tags?: string[];
}

export interface AndroidKeystoreOptions {
  alias: string;
  password?: string;
  algorithm?: 'RSA' | 'AES';
  keySize?: number;
  purposes?: ('encrypt' | 'decrypt' | 'sign' | 'verify')[];
  userAuthenticationRequired?: boolean;
  userAuthenticationValidityDurationSeconds?: number;
  invalidatedByBiometricEnrollment?: boolean;
}

export interface AndroidNetworkInfo {
  type: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'vpn' | 'none';
  isConnected: boolean;
  isInternetReachable: boolean;
  isWifiEnabled: boolean;
  details: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: '2g' | '3g' | '4g' | '5g';
    carrier?: string;
    ipAddress?: string;
    subnet?: string;
    ssid?: string;
    bssid?: string;
    strength?: number;
    frequency?: number;
    linkSpeed?: number;
  };
}

export interface AndroidStorageInfo {
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  isExternalStorageAvailable: boolean;
  isExternalStorageRemovable: boolean;
  isExternalStorageEmulated: boolean;
  externalStoragePath?: string;
  internalStoragePath: string;
  cacheDirectory: string;
  filesDirectory: string;
}

export interface AndroidDeviceInfo {
  apiLevel: number;
  androidVersion: string;
  brand: string;
  model: string;
  manufacturer: string;
  deviceId: string;
  isTablet: boolean;
  isEmulator: boolean;
  isRooted: boolean;
  hasNotch: boolean;
  screenDensity: number;
  screenWidth: number;
  screenHeight: number;
  availableMemory: number;
  totalMemory: number;
  cpuArchitecture: string;
  supportedAbis: string[];
}

export interface MaterialTheme {
  colorScheme: {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    error: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    background: string;
    onBackground: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    shadow: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
  };
  typography: {
    displayLarge: TextStyle;
    displayMedium: TextStyle;
    displaySmall: TextStyle;
    headlineLarge: TextStyle;
    headlineMedium: TextStyle;
    headlineSmall: TextStyle;
    titleLarge: TextStyle;
    titleMedium: TextStyle;
    titleSmall: TextStyle;
    bodyLarge: TextStyle;
    bodyMedium: TextStyle;
    bodySmall: TextStyle;
    labelLarge: TextStyle;
    labelMedium: TextStyle;
    labelSmall: TextStyle;
  };
  shapes: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  elevation: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface AndroidAccessibilityInfo {
  isScreenReaderEnabled: boolean;
  isTouchExplorationEnabled: boolean;
  isAccessibilityServiceEnabled: boolean;
  recommendedTimeout: number;
  fontScale: number;
  isHighTextContrastEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isBoldTextEnabled: boolean;
}

export interface GooglePlayBilling {
  productId: string;
  type: 'inapp' | 'subs';
  price: string;
  currency: string;
  localizedPrice: string;
  title: string;
  description: string;
  subscriptionPeriod?: string;
  freeTrialPeriod?: string;
  introductoryPrice?: string;
  introductoryPricePeriod?: string;
  introductoryPriceCycles?: number;
}

export interface AndroidAppUpdate {
  updateAvailability: 'update_available' | 'update_not_available' | 'update_in_progress';
  updatePriority: number;
  isUpdateTypeAllowed: {
    immediate: boolean;
    flexible: boolean;
  };
  availableVersionCode?: number;
  clientVersionStalenessDays?: number;
}