import { Platform } from 'react-native';
import TouchID from 'react-native-touch-id';
import * as Keychain from 'react-native-keychain';
import { BiometricType } from '@/types/ios';

class BiometricService {
  private isSupported: boolean = false;
  private biometryType: BiometricType = BiometricType.NONE;

  /**
   * Initialize biometric service
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('BiometricService is iOS only');
      return;
    }

    try {
      const biometryType = await TouchID.isSupported();
      this.isSupported = true;
      this.biometryType = biometryType as BiometricType;
    } catch (error) {
      this.isSupported = false;
      this.biometryType = BiometricType.NONE;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      await TouchID.isSupported();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the type of biometric available
   */
  async getBiometricType(): Promise<BiometricType> {
    if (Platform.OS !== 'ios') return BiometricType.NONE;

    try {
      const type = await TouchID.isSupported();
      return type as BiometricType;
    } catch (error) {
      return BiometricType.NONE;
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticate(reason: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    const optionalConfigObject = {
      title: 'Authentication Required',
      imageColor: '#FF7979',
      imageErrorColor: '#ff0000',
      sensorDescription: this.biometryType === BiometricType.FACE_ID ? 'Face ID' : 'Touch ID',
      sensorErrorDescription: 'Failed',
      cancelText: 'Cancel',
      fallbackLabel: 'Use Passcode',
      unifiedErrors: false,
      passcodeFallback: true,
    };

    try {
      const biometryType = await TouchID.authenticate(reason, optionalConfigObject);
      return true;
    } catch (error: any) {
      console.error('Biometric authentication failed:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'UserCancel':
        case 'SystemCancel':
          throw new Error('Authentication cancelled');
        case 'UserFallback':
          // User chose to use passcode
          return await this.authenticateWithPasscode();
        case 'BiometryNotAvailable':
          throw new Error('Biometric authentication not available');
        case 'BiometryNotEnrolled':
          throw new Error('No biometric credentials enrolled');
        case 'BiometryLockout':
          throw new Error('Too many failed attempts. Biometry is locked');
        default:
          throw new Error('Authentication failed');
      }
    }
  }

  /**
   * Authenticate with device passcode
   */
  async authenticateWithPasscode(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      // This would typically trigger the system passcode UI
      // Implementation depends on additional native module
      return true;
    } catch (error) {
      console.error('Passcode authentication failed:', error);
      return false;
    }
  }

  /**
   * Store credentials in keychain with biometric protection
   */
  async storeSecureCredentials(
    username: string,
    password: string,
    options?: {
      service?: string;
      accessControl?: Keychain.ACCESS_CONTROL;
      accessible?: Keychain.ACCESSIBLE;
      authenticatePrompt?: string;
    }
  ): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      const keychainOptions: Keychain.Options = {
        service: options?.service || 'com.pairity.app',
        accessControl: options?.accessControl || Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: options?.accessible || Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        authenticatePrompt: options?.authenticatePrompt || 'Authenticate to save credentials',
        authenticationPrompt: 'Authenticate to save credentials',
      };

      await Keychain.setInternetCredentials(
        'https://pairity.com',
        username,
        password,
        keychainOptions
      );

      return true;
    } catch (error) {
      console.error('Failed to store credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve credentials from keychain with biometric authentication
   */
  async getSecureCredentials(
    service?: string,
    authenticatePrompt?: string
  ): Promise<{ username: string; password: string } | null> {
    if (Platform.OS !== 'ios') return null;

    try {
      const keychainOptions: Keychain.Options = {
        service: service || 'com.pairity.app',
        authenticationPrompt: authenticatePrompt || 'Authenticate to retrieve credentials',
      };

      const credentials = await Keychain.getInternetCredentials(
        'https://pairity.com',
        keychainOptions
      );

      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Remove credentials from keychain
   */
  async removeSecureCredentials(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      await Keychain.resetInternetCredentials('https://pairity.com');
      return true;
    } catch (error) {
      console.error('Failed to remove credentials:', error);
      return false;
    }
  }

  /**
   * Check if app lock is enabled
   */
  async isAppLockEnabled(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      const hasCredentials = await Keychain.hasInternetCredentials('https://pairity.com');
      return hasCredentials;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable app lock with biometric protection
   */
  async enableAppLock(pin: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      await this.storeSecureCredentials('app_lock', pin, {
        service: 'com.pairity.app.lock',
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        authenticatePrompt: 'Authenticate to enable app lock',
      });
      return true;
    } catch (error) {
      console.error('Failed to enable app lock:', error);
      return false;
    }
  }

  /**
   * Disable app lock
   */
  async disableAppLock(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      const authenticated = await this.authenticate('Authenticate to disable app lock');
      if (!authenticated) return false;

      await Keychain.resetInternetCredentials('https://pairity.com');
      return true;
    } catch (error) {
      console.error('Failed to disable app lock:', error);
      return false;
    }
  }

  /**
   * Verify app lock
   */
  async verifyAppLock(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      const authenticated = await this.authenticate('Unlock Pairity');
      return authenticated;
    } catch (error) {
      console.error('App lock verification failed:', error);
      return false;
    }
  }

  /**
   * Check if biometric enrollment has changed
   */
  async hasBiometricChanged(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      // This would require storing and comparing biometric enrollment state
      // Implementation depends on additional native module capabilities
      return false;
    } catch (error) {
      return false;
    }
  }
}

export const biometricService = new BiometricService();