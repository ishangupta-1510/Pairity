import { useEffect, useState, useCallback, useRef } from 'react';
import {
  AccessibilityInfo,
  Platform,
  findNodeHandle,
  InteractionManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AccessibilitySettings,
  AnnouncementOptions,
  FocusOptions,
  ScreenReaderStatus,
  ColorBlindMode,
} from '@/types/accessibility';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  isInvertColorsEnabled: false,
  fontScale: 1,
  prefersCrossFadeTransitions: false,
  highContrast: false,
  colorBlindMode: ColorBlindMode.NONE,
  dyslexiaFriendly: false,
  hapticFeedback: true,
  announceNotifications: true,
  autoPlayVideos: true,
  showCaptions: false,
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [screenReader, setScreenReader] = useState<ScreenReaderStatus>({
    enabled: false,
  });
  const announcementQueue = useRef<AnnouncementOptions[]>([]);
  const isProcessingAnnouncements = useRef(false);

  // Load accessibility settings
  useEffect(() => {
    loadAccessibilitySettings();
    detectScreenReader();
    setupAccessibilityListeners();
  }, []);

  const loadAccessibilitySettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('accessibility_settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }
  };

  const saveAccessibilitySettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem('accessibility_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  };

  const detectScreenReader = async () => {
    try {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReader({
        enabled,
        type: Platform.OS === 'ios' ? 'VoiceOver' : 'TalkBack',
      });
    } catch (error) {
      console.error('Failed to detect screen reader:', error);
    }
  };

  const setupAccessibilityListeners = () => {
    // Screen reader change listener
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setScreenReader(prev => ({ ...prev, enabled }));
      }
    );

    // Reduce motion listener
    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        updateSetting('isReduceMotionEnabled', enabled);
      }
    );

    // Bold text listener (iOS)
    if (Platform.OS === 'ios') {
      const boldTextSubscription = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        (enabled) => {
          updateSetting('isBoldTextEnabled', enabled);
        }
      );
    }

    // Reduce transparency listener (iOS)
    if (Platform.OS === 'ios') {
      const reduceTransparencySubscription = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        (enabled) => {
          updateSetting('isReduceTransparencyEnabled', enabled);
        }
      );
    }

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  };

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      saveAccessibilitySettings(newSettings);
      return newSettings;
    });
  }, []);

  // Announce message to screen readers
  const announce = useCallback((options: AnnouncementOptions) => {
    if (!screenReader.enabled) return;

    if (options.queue || isProcessingAnnouncements.current) {
      announcementQueue.current.push(options);
      return;
    }

    processAnnouncement(options);
  }, [screenReader.enabled]);

  const processAnnouncement = async (options: AnnouncementOptions) => {
    isProcessingAnnouncements.current = true;

    try {
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }

      await AccessibilityInfo.announceForAccessibility(options.message);

      // Process queue
      if (announcementQueue.current.length > 0) {
        const nextAnnouncement = announcementQueue.current.shift();
        if (nextAnnouncement) {
          setTimeout(() => processAnnouncement(nextAnnouncement), 500);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to announce:', error);
    } finally {
      if (announcementQueue.current.length === 0) {
        isProcessingAnnouncements.current = false;
      }
    }
  };

  // Focus management
  const focus = useCallback((options: FocusOptions) => {
    const performFocus = () => {
      if (options.elementId) {
        const element = findNodeHandle(options.elementId as any);
        if (element) {
          AccessibilityInfo.setAccessibilityFocus(element);
        }
      }
    };

    if (options.delay) {
      setTimeout(performFocus, options.delay);
    } else {
      InteractionManager.runAfterInteractions(performFocus);
    }
  }, []);

  // Get accessible colors based on settings
  const getAccessibleColors = useCallback((colors: any) => {
    let adjustedColors = { ...colors };

    if (settings.highContrast) {
      adjustedColors = {
        ...adjustedColors,
        background: settings.isInvertColorsEnabled ? '#000000' : '#FFFFFF',
        text: settings.isInvertColorsEnabled ? '#FFFFFF' : '#000000',
        border: settings.isInvertColorsEnabled ? '#FFFFFF' : '#000000',
      };
    }

    if (settings.isGrayscaleEnabled) {
      // Convert colors to grayscale
      Object.keys(adjustedColors).forEach(key => {
        const color = adjustedColors[key];
        if (typeof color === 'string' && color.startsWith('#')) {
          adjustedColors[key] = convertToGrayscale(color);
        }
      });
    }

    if (settings.colorBlindMode !== ColorBlindMode.NONE) {
      adjustedColors = applyColorBlindFilter(adjustedColors, settings.colorBlindMode);
    }

    return adjustedColors;
  }, [settings]);

  // Get accessible font size
  const getAccessibleFontSize = useCallback((baseSize: number) => {
    return baseSize * settings.fontScale;
  }, [settings.fontScale]);

  // Check if animations should be reduced
  const shouldReduceMotion = useCallback(() => {
    return settings.isReduceMotionEnabled;
  }, [settings.isReduceMotionEnabled]);

  // Check if transparency should be reduced
  const shouldReduceTransparency = useCallback(() => {
    return settings.isReduceTransparencyEnabled;
  }, [settings.isReduceTransparencyEnabled]);

  // Announce navigation change
  const announceNavigation = useCallback((screenName: string, description?: string) => {
    if (!screenReader.enabled) return;

    const message = description 
      ? `${screenName}. ${description}` 
      : `Navigated to ${screenName}`;

    announce({
      message,
      priority: 'polite',
      delay: 500, // Allow screen to settle
    });
  }, [screenReader.enabled, announce]);

  // Announce loading state
  const announceLoading = useCallback((isLoading: boolean, message?: string) => {
    if (!screenReader.enabled) return;

    const loadingMessage = message || (isLoading ? 'Loading' : 'Loading complete');
    
    announce({
      message: loadingMessage,
      priority: isLoading ? 'polite' : 'assertive',
    });
  }, [screenReader.enabled, announce]);

  // Announce error
  const announceError = useCallback((error: string) => {
    if (!screenReader.enabled) return;

    announce({
      message: `Error: ${error}`,
      priority: 'assertive',
    });
  }, [screenReader.enabled, announce]);

  // Announce success
  const announceSuccess = useCallback((message: string) => {
    if (!screenReader.enabled) return;

    announce({
      message: `Success: ${message}`,
      priority: 'polite',
    });
  }, [screenReader.enabled, announce]);

  return {
    settings,
    screenReader,
    announce,
    focus,
    updateSetting,
    getAccessibleColors,
    getAccessibleFontSize,
    shouldReduceMotion,
    shouldReduceTransparency,
    announceNavigation,
    announceLoading,
    announceError,
    announceSuccess,
  };
};

// Helper functions
const convertToGrayscale = (color: string): string => {
  // Simple grayscale conversion
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const grayHex = gray.toString(16).padStart(2, '0');
  
  return `#${grayHex}${grayHex}${grayHex}`;
};

const applyColorBlindFilter = (colors: any, mode: ColorBlindMode): any => {
  // Color blind filter implementation
  // This is a simplified version - in production, use proper color transformation matrices
  return colors;
};