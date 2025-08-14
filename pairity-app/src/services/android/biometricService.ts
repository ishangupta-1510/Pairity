import { Platform, NativeModules } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import { AndroidBiometricType, AndroidKeystoreOptions } from '@/types/android';

class AndroidBiometricService {
  private rnBiometrics: ReactNativeBiometrics;
  private isSupported: boolean = false;
  private biometryType: AndroidBiometricType = AndroidBiometricType.NONE;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
    this.initialize();
  }

  /**
   * Initialize biometric service
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'android') {
      console.log('AndroidBiometricService is Android only');
      return;
    }

    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      this.isSupported = available;
      this.biometryType = this.mapBiometryType(biometryType);
    } catch (error) {
      this.isSupported = false;
      this.biometryType = AndroidBiometricType.NONE;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the type of biometric available
   */
  async getBiometricType(): Promise<AndroidBiometricType> {
    if (Platform.OS !== 'android') return AndroidBiometricType.NONE;

    try {
      const { biometryType } = await this.rnBiometrics.isSensorAvailable();
      return this.mapBiometryType(biometryType);
    } catch (error) {
      return AndroidBiometricType.NONE;
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticate(
    title: string,
    description?: string,
    cancelButtonText?: string
  ): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: title,
        fallbackPromptMessage: description || 'Use device credentials',
        cancelButtonText: cancelButtonText || 'Cancel',
      });

      return success;
    } catch (error: any) {
      console.error('Biometric authentication failed:', error);
      
      // Handle specific error cases
      if (error.code === 'UserCancel') {
        throw new Error('Authentication cancelled');
      } else if (error.code === 'BiometryNotAvailable') {
        throw new Error('Biometric authentication not available');
      } else if (error.code === 'BiometryNotEnrolled') {
        throw new Error('No biometric credentials enrolled');
      } else if (error.code === 'BiometryLockout') {
        throw new Error('Too many failed attempts. Biometry is locked');
      }
      
      throw new Error('Authentication failed');
    }
  }

  /**
   * Create biometric keys
   */
  async createKeys(): Promise<{ publicKey: string }> {
    if (Platform.OS !== 'android') {
      throw new Error('This method is Android only');
    }

    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      return { publicKey };
    } catch (error) {
      console.error('Failed to create biometric keys:', error);
      throw error;
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteKeys(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Failed to delete biometric keys:', error);
      return false;
    }
  }

  /**
   * Check if biometric keys exist
   */
  async biometricKeysExist(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Failed to check biometric keys:', error);
      return false;
    }
  }

  /**
   * Create signature with biometric authentication
   */
  async createSignature(
    payload: string,
    promptMessage: string
  ): Promise<{ success: boolean; signature?: string }> {
    if (Platform.OS !== 'android') {
      return { success: false };
    }

    try {
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
      });

      return { success, signature };
    } catch (error) {
      console.error('Failed to create signature:', error);
      return { success: false };
    }
  }

  /**
   * Store encrypted data in Android Keystore
   */
  async storeInKeystore(
    alias: string,
    data: string,
    options?: AndroidKeystoreOptions
  ): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const keychainOptions: Keychain.Options = {
        service: alias,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        authenticatePrompt: 'Authenticate to save data',
        authenticationPrompt: 'Authenticate to save data',
        ...(options?.userAuthenticationRequired && {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        }),
      };

      await Keychain.setInternetCredentials(
        alias,
        'data',
        data,
        keychainOptions
      );

      return true;
    } catch (error) {
      console.error('Failed to store in keystore:', error);
      return false;
    }
  }

  /**
   * Retrieve encrypted data from Android Keystore
   */
  async retrieveFromKeystore(
    alias: string,
    authenticatePrompt?: string
  ): Promise<string | null> {
    if (Platform.OS !== 'android') return null;

    try {
      const keychainOptions: Keychain.Options = {
        service: alias,
        authenticationPrompt: authenticatePrompt || 'Authenticate to retrieve data',
      };

      const credentials = await Keychain.getInternetCredentials(
        alias,
        keychainOptions
      );

      if (credentials) {
        return credentials.password;
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve from keystore:', error);
      return null;
    }
  }

  /**
   * Remove data from Android Keystore
   */
  async removeFromKeystore(alias: string): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      await Keychain.resetInternetCredentials(alias);
      return true;
    } catch (error) {
      console.error('Failed to remove from keystore:', error);
      return false;
    }
  }

  /**
   * Check if device has secure lock screen
   */
  async hasSecureLockScreen(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      // This would check KeyguardManager.isDeviceSecure()
      // Requires native module implementation
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Map biometry type string to enum
   */
  private mapBiometryType(type?: string): AndroidBiometricType {
    switch (type) {
      case 'Biometrics':
      case 'Fingerprint':
        return AndroidBiometricType.FINGERPRINT;
      case 'Face':
      case 'FaceID':
        return AndroidBiometricType.FACE;
      case 'Iris':
        return AndroidBiometricType.IRIS;
      default:
        return AndroidBiometricType.NONE;
    }
  }

  /**
   * Request device credentials authentication
   */
  async authenticateWithDeviceCredentials(
    title: string,
    description?: string
  ): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      // This would trigger device credential authentication
      // Requires native module implementation
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: title,
        fallbackPromptMessage: description || 'Enter device PIN, pattern, or password',
        cancelButtonText: 'Cancel',
      });

      return success;
    } catch (error) {
      console.error('Device credential authentication failed:', error);
      return false;
    }
  }

  /**
   * Check if biometric hardware is present
   */
  async hasBiometricHardware(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if biometric enrollment has changed
   */
  async hasBiometricChanged(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      // This would check if biometric enrollment has changed
      // Requires native module implementation
      return false;
    } catch (error) {
      return false;
    }
  }
}

export const androidBiometricService = new AndroidBiometricService();