import { Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { IOSCameraSettings, IOSPhotoLibraryOptions } from '@/types/ios';

class IOSCameraService {
  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  }

  /**
   * Request photo library permission
   */
  async requestPhotoLibraryPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Failed to request photo library permission:', error);
      return false;
    }
  }

  /**
   * Take photo with camera
   */
  async takePhoto(settings?: IOSCameraSettings): Promise<ImagePickerResponse> {
    if (Platform.OS !== 'ios') {
      throw new Error('This method is iOS only');
    }

    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      quality: settings?.quality || 0.8,
      cameraType: settings?.cameraType || 'back',
      saveToPhotos: settings?.saveToPhotos ?? true,
      includeBase64: false,
      includeExtra: true,
      presentationStyle: 'fullScreen',
    };

    return new Promise((resolve, reject) => {
      launchCamera(options, (response) => {
        if (response.didCancel) {
          reject(new Error('User cancelled'));
        } else if (response.errorMessage) {
          reject(new Error(response.errorMessage));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Record video with camera
   */
  async recordVideo(settings?: IOSCameraSettings): Promise<ImagePickerResponse> {
    if (Platform.OS !== 'ios') {
      throw new Error('This method is iOS only');
    }

    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const options: CameraOptions = {
      mediaType: 'video',
      videoQuality: settings?.quality === 1 ? 'high' : settings?.quality === 0.5 ? 'medium' : 'low',
      durationLimit: settings?.maxDuration || 60,
      cameraType: settings?.cameraType || 'back',
      saveToPhotos: settings?.saveToPhotos ?? true,
      includeBase64: false,
      includeExtra: true,
      presentationStyle: 'fullScreen',
    };

    return new Promise((resolve, reject) => {
      launchCamera(options, (response) => {
        if (response.didCancel) {
          reject(new Error('User cancelled'));
        } else if (response.errorMessage) {
          reject(new Error(response.errorMessage));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Select from photo library
   */
  async selectFromLibrary(options?: IOSPhotoLibraryOptions): Promise<ImagePickerResponse> {
    if (Platform.OS !== 'ios') {
      throw new Error('This method is iOS only');
    }

    const hasPermission = await this.requestPhotoLibraryPermission();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    const libraryOptions: ImageLibraryOptions = {
      mediaType: options?.mediaType || 'photo',
      quality: options?.quality || 0.8,
      selectionLimit: options?.allowsMultipleSelection 
        ? (options.selectionLimit || 10) 
        : 1,
      includeBase64: options?.includeBase64 || false,
      includeExtra: options?.includeExtra ?? true,
      presentationStyle: 'pageSheet',
    };

    return new Promise((resolve, reject) => {
      launchImageLibrary(libraryOptions, (response) => {
        if (response.didCancel) {
          reject(new Error('User cancelled'));
        } else if (response.errorMessage) {
          reject(new Error(response.errorMessage));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Process image with face detection
   */
  async detectFaces(imageUri: string): Promise<any[]> {
    if (Platform.OS !== 'ios') return [];

    // This would use Vision framework through a native module
    // Placeholder implementation
    return [];
  }

  /**
   * Apply filter to image
   */
  async applyFilter(imageUri: string, filterName: string): Promise<string> {
    if (Platform.OS !== 'ios') return imageUri;

    // This would use Core Image filters through a native module
    // Placeholder implementation
    return imageUri;
  }

  /**
   * Crop image
   */
  async cropImage(
    imageUri: string,
    cropData: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ): Promise<string> {
    if (Platform.OS !== 'ios') return imageUri;

    // This would use native image cropping
    // Placeholder implementation
    return imageUri;
  }

  /**
   * Check if Live Photo
   */
  async isLivePhoto(imageUri: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    // This would check PHAsset for live photo
    // Placeholder implementation
    return false;
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(imageUri: string): Promise<any> {
    if (Platform.OS !== 'ios') return null;

    // This would extract EXIF and other metadata
    // Placeholder implementation
    return {
      width: 0,
      height: 0,
      orientation: 1,
      timestamp: new Date(),
      location: null,
    };
  }

  /**
   * Save image to photo library
   */
  async saveToPhotoLibrary(imageUri: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    const hasPermission = await this.requestPhotoLibraryPermission();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    try {
      // This would use Photos framework to save
      // Placeholder implementation
      return true;
    } catch (error) {
      console.error('Failed to save to photo library:', error);
      return false;
    }
  }

  /**
   * Compress image
   */
  async compressImage(
    imageUri: string,
    quality: number = 0.8,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<string> {
    if (Platform.OS !== 'ios') return imageUri;

    // This would use native image compression
    // Placeholder implementation
    return imageUri;
  }

  /**
   * Check camera availability
   */
  async isCameraAvailable(cameraType: 'front' | 'back' = 'back'): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    // This would check AVCaptureDevice availability
    // Placeholder implementation
    return true;
  }

  /**
   * Get available camera features
   */
  async getCameraFeatures(): Promise<{
    hasFlash: boolean;
    hasFrontCamera: boolean;
    hasBackCamera: boolean;
    hasPortraitMode: boolean;
    hasNightMode: boolean;
    hasWideAngle: boolean;
    hasTelephoto: boolean;
  }> {
    if (Platform.OS !== 'ios') {
      return {
        hasFlash: false,
        hasFrontCamera: false,
        hasBackCamera: false,
        hasPortraitMode: false,
        hasNightMode: false,
        hasWideAngle: false,
        hasTelephoto: false,
      };
    }

    // This would check device capabilities
    // Placeholder implementation
    return {
      hasFlash: true,
      hasFrontCamera: true,
      hasBackCamera: true,
      hasPortraitMode: true,
      hasNightMode: true,
      hasWideAngle: true,
      hasTelephoto: false,
    };
  }
}

export const iosCameraService = new IOSCameraService();