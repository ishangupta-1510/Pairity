export enum BiometricType {
  FACE_ID = 'FaceID',
  TOUCH_ID = 'TouchID',
  NONE = 'None',
}

export interface IOSPermission {
  camera: 'granted' | 'denied' | 'restricted' | 'undetermined';
  photoLibrary: 'granted' | 'denied' | 'restricted' | 'undetermined';
  microphone: 'granted' | 'denied' | 'restricted' | 'undetermined';
  location: 'granted' | 'denied' | 'restricted' | 'undetermined';
  notifications: 'granted' | 'denied' | 'not-determined';
  contacts: 'granted' | 'denied' | 'restricted' | 'undetermined';
  faceID: 'granted' | 'denied' | 'restricted' | 'undetermined';
  appTrackingTransparency: 'granted' | 'denied' | 'restricted' | 'undetermined';
}

export interface IOSNotificationSettings {
  alert: boolean;
  badge: boolean;
  sound: boolean;
  criticalAlert: boolean;
  provisional: boolean;
  announcement: boolean;
  authorizationStatus: 'authorized' | 'denied' | 'notDetermined' | 'provisional';
}

export interface IOSNotificationCategory {
  identifier: string;
  actions: IOSNotificationAction[];
  intentIdentifiers?: string[];
  hiddenPreviewsBodyPlaceholder?: string;
  categorySummaryFormat?: string;
  options?: IOSNotificationCategoryOption[];
}

export interface IOSNotificationAction {
  identifier: string;
  title: string;
  options?: IOSNotificationActionOption[];
  textInput?: {
    buttonTitle: string;
    placeholder: string;
  };
}

export enum IOSNotificationCategoryOption {
  CUSTOM_DISMISS_ACTION = 'customDismissAction',
  ALLOW_IN_CAR_PLAY = 'allowInCarPlay',
  HIDDEN_PREVIEWS_SHOW_TITLE = 'hiddenPreviewsShowTitle',
  HIDDEN_PREVIEWS_SHOW_SUBTITLE = 'hiddenPreviewsShowSubtitle',
  ALLOW_ANNOUNCEMENT = 'allowAnnouncement',
}

export enum IOSNotificationActionOption {
  AUTHENTICATION_REQUIRED = 'authenticationRequired',
  DESTRUCTIVE = 'destructive',
  FOREGROUND = 'foreground',
}

export interface IOSDeepLink {
  url: string;
  scheme: string;
  path: string;
  queryParams?: Record<string, string>;
}

export interface SiriShortcut {
  identifier: string;
  title: string;
  suggestedInvocationPhrase: string;
  userInfo: Record<string, any>;
  isEligibleForSearch: boolean;
  isEligibleForPrediction: boolean;
}

export interface SpotlightItem {
  uniqueIdentifier: string;
  domainIdentifier: string;
  title: string;
  contentDescription?: string;
  thumbnailData?: string;
  keywords?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface IOSBackgroundTask {
  identifier: string;
  earliestBeginDate?: Date;
  requiresNetworkConnectivity: boolean;
  requiresExternalPower: boolean;
}

export interface IOSKeychainItem {
  service: string;
  account: string;
  password?: string;
  accessGroup?: string;
  accessible: IOSKeychainAccessible;
  authenticatePrompt?: string;
}

export enum IOSKeychainAccessible {
  WHEN_UNLOCKED = 'AccessibleWhenUnlocked',
  AFTER_FIRST_UNLOCK = 'AccessibleAfterFirstUnlock',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'AccessibleWhenUnlockedThisDeviceOnly',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'AccessibleWhenPasscodeSetThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 'AccessibleAfterFirstUnlockThisDeviceOnly',
}

export interface IOSHapticFeedback {
  type: 'impact' | 'notification' | 'selection';
  intensity?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
}

export interface IOSCameraSettings {
  quality: number;
  cameraType: 'front' | 'back';
  flashMode: 'off' | 'on' | 'auto';
  videoStabilization: boolean;
  maxDuration?: number;
  maxFileSize?: number;
  saveToPhotos: boolean;
}

export interface IOSPhotoLibraryOptions {
  mediaType: 'photo' | 'video' | 'mixed';
  allowsEditing: boolean;
  allowsMultipleSelection: boolean;
  selectionLimit?: number;
  includeBase64: boolean;
  includeExtra: boolean;
  quality: number;
}

export interface IOSAppearance {
  style: 'light' | 'dark' | 'automatic';
  tintColor?: string;
  barTintColor?: string;
  titleTextAttributes?: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
  };
  largeTitleTextAttributes?: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
  };
}

export interface IOSNavigationOptions {
  largeTitles: boolean;
  searchBar?: {
    placeholder?: string;
    barTintColor?: string;
    tintColor?: string;
  };
  backButton?: {
    title?: string;
    tintColor?: string;
  };
  rightBarButtons?: Array<{
    systemItem?: string;
    title?: string;
    image?: string;
    action: () => void;
  }>;
}

export interface IOSActionSheetOptions {
  title?: string;
  message?: string;
  options: string[];
  destructiveButtonIndex?: number;
  cancelButtonIndex?: number;
  tintColor?: string;
  anchor?: number;
}

export interface IOSAlertOptions {
  title: string;
  message?: string;
  buttons?: Array<{
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }>;
  textInputs?: Array<{
    placeholder?: string;
    defaultValue?: string;
    keyboardType?: string;
    secureTextEntry?: boolean;
  }>;
}

export interface IOSShareOptions {
  message?: string;
  url?: string;
  title?: string;
  subject?: string;
  excludedActivityTypes?: string[];
}

export interface IOSAppClipConfig {
  invocationURL: string;
  bundleIdentifier: string;
  isAvailable: boolean;
}

export interface IOSWidgetConfig {
  kind: string;
  family: 'small' | 'medium' | 'large' | 'extraLarge';
  supportedFamilies: string[];
  intentConfiguration?: any;
}

export interface IOSLiveActivityConfig {
  activityIdentifier: string;
  attributes: Record<string, any>;
  contentState: Record<string, any>;
  pushToken?: string;
}

export interface IOSAppStoreConfig {
  appId: string;
  bundleId: string;
  teamId: string;
  sku: string;
  primaryCategory: string;
  secondaryCategory?: string;
  minimumOSVersion: string;
  supportedDevices: string[];
}

export interface IOSTestFlightConfig {
  betaAppReviewInfo: {
    contactEmail: string;
    contactFirstName: string;
    contactLastName: string;
    contactPhone: string;
    demoAccountName?: string;
    demoAccountPassword?: string;
  };
  betaGroups: string[];
  publicLink?: string;
  publicLinkLimit?: number;
}

export interface IOSInAppPurchase {
  productId: string;
  productType: 'consumable' | 'non-consumable' | 'subscription';
  localizedTitle: string;
  localizedDescription: string;
  price: string;
  priceLocale: string;
  currencyCode: string;
  subscriptionPeriod?: {
    unit: 'day' | 'week' | 'month' | 'year';
    numberOfUnits: number;
  };
  introductoryPrice?: {
    price: string;
    paymentMode: 'payAsYouGo' | 'payUpFront' | 'freeTrial';
    numberOfPeriods: number;
  };
}