import { Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { IOSHapticFeedback } from '@/types/ios';

class IOSHapticService {
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  /**
   * Check if haptic feedback is supported
   */
  private checkSupport(): void {
    this.isSupported = Platform.OS === 'ios' && Platform.Version >= 10;
  }

  /**
   * Trigger haptic feedback
   */
  trigger(feedback: IOSHapticFeedback): void {
    if (!this.isSupported) return;

    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };

    switch (feedback.type) {
      case 'impact':
        this.triggerImpact(feedback.intensity || 'medium');
        break;
      case 'notification':
        this.triggerNotification(feedback.intensity as any || 'success');
        break;
      case 'selection':
        this.triggerSelection();
        break;
    }
  }

  /**
   * Trigger impact feedback
   */
  private triggerImpact(intensity: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid'): void {
    let hapticType: string;

    switch (intensity) {
      case 'light':
        hapticType = 'impactLight';
        break;
      case 'heavy':
        hapticType = 'impactHeavy';
        break;
      case 'soft':
        hapticType = 'soft';
        break;
      case 'rigid':
        hapticType = 'rigid';
        break;
      case 'medium':
      default:
        hapticType = 'impactMedium';
        break;
    }

    ReactNativeHapticFeedback.trigger(hapticType as any);
  }

  /**
   * Trigger notification feedback
   */
  private triggerNotification(type: 'success' | 'warning' | 'error'): void {
    let hapticType: string;

    switch (type) {
      case 'success':
        hapticType = 'notificationSuccess';
        break;
      case 'warning':
        hapticType = 'notificationWarning';
        break;
      case 'error':
        hapticType = 'notificationError';
        break;
      default:
        hapticType = 'notificationSuccess';
    }

    ReactNativeHapticFeedback.trigger(hapticType as any);
  }

  /**
   * Trigger selection feedback
   */
  private triggerSelection(): void {
    ReactNativeHapticFeedback.trigger('selection');
  }

  /**
   * Common haptic patterns
   */
  
  // Button tap
  buttonTap(): void {
    this.trigger({ type: 'impact', intensity: 'light' });
  }

  // Success action
  success(): void {
    this.trigger({ type: 'notification', intensity: 'success' as any });
  }

  // Error action
  error(): void {
    this.trigger({ type: 'notification', intensity: 'error' as any });
  }

  // Warning action
  warning(): void {
    this.trigger({ type: 'notification', intensity: 'warning' as any });
  }

  // Selection change
  selectionChanged(): void {
    this.trigger({ type: 'selection' });
  }

  // Heavy action (delete, important action)
  heavyImpact(): void {
    this.trigger({ type: 'impact', intensity: 'heavy' });
  }

  // Soft action
  softImpact(): void {
    this.trigger({ type: 'impact', intensity: 'soft' });
  }

  // Pull to refresh
  pullToRefresh(): void {
    this.trigger({ type: 'impact', intensity: 'medium' });
  }

  // Swipe action
  swipe(): void {
    this.trigger({ type: 'impact', intensity: 'light' });
  }

  // Long press
  longPress(): void {
    this.trigger({ type: 'impact', intensity: 'medium' });
  }

  // Toggle switch
  toggleSwitch(): void {
    this.trigger({ type: 'selection' });
  }

  // Slider change
  sliderChange(): void {
    this.trigger({ type: 'selection' });
  }

  // Tab selection
  tabSelected(): void {
    this.trigger({ type: 'impact', intensity: 'light' });
  }

  // Modal open
  modalOpen(): void {
    this.trigger({ type: 'impact', intensity: 'soft' });
  }

  // Modal close
  modalClose(): void {
    this.trigger({ type: 'impact', intensity: 'soft' });
  }

  // Match celebration
  matchCelebration(): void {
    this.trigger({ type: 'notification', intensity: 'success' as any });
  }

  // Message received
  messageReceived(): void {
    this.trigger({ type: 'notification', intensity: 'success' as any });
  }

  // Like received
  likeReceived(): void {
    this.trigger({ type: 'impact', intensity: 'medium' });
  }

  /**
   * Custom haptic pattern
   */
  async customPattern(pattern: number[]): Promise<void> {
    if (!this.isSupported) return;

    for (let i = 0; i < pattern.length; i++) {
      if (i % 2 === 0) {
        // Vibrate
        this.trigger({ type: 'impact', intensity: 'light' });
      }
      // Wait
      await new Promise(resolve => setTimeout(resolve, pattern[i]));
    }
  }

  /**
   * Check if haptic feedback is enabled in settings
   */
  isEnabled(): boolean {
    // This would check system settings
    // For now, return based on platform support
    return this.isSupported;
  }
}

export const iosHapticService = new IOSHapticService();