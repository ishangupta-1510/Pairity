import { AccessibilityRole, AccessibilityState } from 'react-native';

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { actionName: string }) => void;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityElementsHidden?: boolean;
  accessibilityViewIsModal?: boolean;
  accessibilityIgnoresInvertColors?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

export interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  fontScale: number;
  prefersCrossFadeTransitions: boolean;
  highContrast: boolean;
  colorBlindMode: ColorBlindMode;
  dyslexiaFriendly: boolean;
  hapticFeedback: boolean;
  announceNotifications: boolean;
  autoPlayVideos: boolean;
  showCaptions: boolean;
}

export enum ColorBlindMode {
  NONE = 'none',
  PROTANOPIA = 'protanopia',
  DEUTERANOPIA = 'deuteranopia',
  TRITANOPIA = 'tritanopia',
  ACHROMATOPSIA = 'achromatopsia',
}

export interface AccessibleComponentProps extends AccessibilityProps {
  testID?: string;
  focusable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface AccessibleFormFieldProps extends AccessibleComponentProps {
  required?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  helpText?: string;
  labelledBy?: string;
  describedBy?: string;
}

export interface AccessibleImageProps extends AccessibleComponentProps {
  isDecorative?: boolean;
  altText?: string;
  longDescription?: string;
}

export interface AccessibleButtonProps extends AccessibleComponentProps {
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean;
  selected?: boolean;
}

export interface AccessibleListItemProps extends AccessibleComponentProps {
  position?: number;
  size?: number;
  level?: number;
  expanded?: boolean;
  selected?: boolean;
}

export interface AnnouncementOptions {
  message: string;
  priority?: 'polite' | 'assertive';
  queue?: boolean;
  delay?: number;
}

export interface FocusOptions {
  elementId?: string;
  delay?: number;
  restore?: boolean;
}

export interface ContrastRatio {
  ratio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  largeText: boolean;
}

export interface TouchTarget {
  width: number;
  height: number;
  isAccessible: boolean;
  meetsGuidelines: boolean;
}

export interface AccessibilityValidation {
  hasLabel: boolean;
  hasHint: boolean;
  hasRole: boolean;
  touchTargetSize: TouchTarget;
  contrastRatio?: ContrastRatio;
  keyboardNavigable: boolean;
  screenReaderNavigable: boolean;
}

export interface AccessibilityTestResult {
  component: string;
  passed: boolean;
  issues: AccessibilityIssue[];
  warnings: AccessibilityWarning[];
}

export interface AccessibilityIssue {
  type: 'error';
  code: string;
  message: string;
  element?: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}

export interface AccessibilityWarning {
  type: 'warning';
  code: string;
  message: string;
  element?: string;
  suggestion?: string;
}

export interface NavigationAnnouncement {
  screen: string;
  message: string;
  focusElement?: string;
}

export interface AccessibilityAction {
  name: string;
  label: string;
  handler: () => void;
}

export interface ScreenReaderStatus {
  enabled: boolean;
  type?: 'VoiceOver' | 'TalkBack' | 'unknown';
  version?: string;
}

export interface AccessibilityContext {
  settings: AccessibilitySettings;
  screenReader: ScreenReaderStatus;
  announce: (options: AnnouncementOptions) => void;
  focus: (options: FocusOptions) => void;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
}