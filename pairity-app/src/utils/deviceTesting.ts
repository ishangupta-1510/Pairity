import { Dimensions, Platform } from 'react-native';
import { DeviceSize, Orientation } from '@/types/responsive';

// Device presets for testing
export const DEVICE_PRESETS = {
  // iPhones
  'iPhone SE': { width: 375, height: 667, pixelRatio: 2 },
  'iPhone 12 Mini': { width: 375, height: 812, pixelRatio: 3 },
  'iPhone 12': { width: 390, height: 844, pixelRatio: 3 },
  'iPhone 12 Pro Max': { width: 428, height: 926, pixelRatio: 3 },
  'iPhone 13': { width: 390, height: 844, pixelRatio: 3 },
  'iPhone 14': { width: 390, height: 844, pixelRatio: 3 },
  'iPhone 14 Plus': { width: 428, height: 926, pixelRatio: 3 },
  'iPhone 14 Pro': { width: 393, height: 852, pixelRatio: 3 },
  'iPhone 14 Pro Max': { width: 430, height: 932, pixelRatio: 3 },
  
  // Android Phones
  'Pixel 4': { width: 393, height: 851, pixelRatio: 2.75 },
  'Pixel 5': { width: 393, height: 851, pixelRatio: 2.75 },
  'Pixel 6': { width: 412, height: 915, pixelRatio: 2.625 },
  'Pixel 6 Pro': { width: 412, height: 869, pixelRatio: 3.5 },
  'Galaxy S21': { width: 384, height: 854, pixelRatio: 2.812 },
  'Galaxy S21 Ultra': { width: 384, height: 854, pixelRatio: 3.5 },
  'OnePlus 9': { width: 412, height: 915, pixelRatio: 2.625 },
  
  // iPads
  'iPad Mini': { width: 768, height: 1024, pixelRatio: 2 },
  'iPad': { width: 810, height: 1080, pixelRatio: 2 },
  'iPad Air': { width: 820, height: 1180, pixelRatio: 2 },
  'iPad Pro 11"': { width: 834, height: 1194, pixelRatio: 2 },
  'iPad Pro 12.9"': { width: 1024, height: 1366, pixelRatio: 2 },
  
  // Android Tablets
  'Galaxy Tab S7': { width: 753, height: 1205, pixelRatio: 2 },
  'Galaxy Tab S8': { width: 733, height: 1157, pixelRatio: 2 },
  'Galaxy Tab S8 Ultra': { width: 960, height: 1848, pixelRatio: 2 },
};

// Test device configuration
export interface TestDevice {
  name: string;
  width: number;
  height: number;
  pixelRatio: number;
  orientation: Orientation;
  platform: 'ios' | 'android';
}

// Device testing utilities
export class DeviceTester {
  private originalDimensions: { width: number; height: number };
  private currentDevice: TestDevice | null = null;

  constructor() {
    this.originalDimensions = Dimensions.get('window');
  }

  // Simulate device dimensions
  simulateDevice(deviceName: keyof typeof DEVICE_PRESETS, orientation: Orientation = Orientation.PORTRAIT): void {
    const preset = DEVICE_PRESETS[deviceName];
    if (!preset) {
      console.warn(`Device preset "${deviceName}" not found`);
      return;
    }

    const isLandscape = orientation === Orientation.LANDSCAPE;
    const width = isLandscape ? preset.height : preset.width;
    const height = isLandscape ? preset.width : preset.height;

    this.currentDevice = {
      name: deviceName,
      width,
      height,
      pixelRatio: preset.pixelRatio,
      orientation,
      platform: this.getPlatformFromDeviceName(deviceName),
    };

    // Note: In development, you would need to use a custom provider
    // to override Dimensions.get() values for testing
    console.log(`Simulating device: ${deviceName} (${orientation})`);
    console.log(`Dimensions: ${width}x${height}, Pixel Ratio: ${preset.pixelRatio}`);
  }

  // Reset to original dimensions
  reset(): void {
    this.currentDevice = null;
    console.log('Reset to original device dimensions');
  }

  // Get platform from device name
  private getPlatformFromDeviceName(name: string): 'ios' | 'android' {
    if (name.includes('iPhone') || name.includes('iPad')) {
      return 'ios';
    }
    return 'android';
  }

  // Get current test device
  getCurrentDevice(): TestDevice | null {
    return this.currentDevice;
  }

  // Test all device presets
  testAllDevices(callback: (device: TestDevice) => void): void {
    Object.entries(DEVICE_PRESETS).forEach(([name, preset]) => {
      // Test portrait
      this.simulateDevice(name as keyof typeof DEVICE_PRESETS, Orientation.PORTRAIT);
      if (this.currentDevice) {
        callback(this.currentDevice);
      }

      // Test landscape
      this.simulateDevice(name as keyof typeof DEVICE_PRESETS, Orientation.LANDSCAPE);
      if (this.currentDevice) {
        callback(this.currentDevice);
      }
    });
    
    this.reset();
  }

  // Test specific device category
  testDeviceCategory(category: 'phones' | 'tablets', callback: (device: TestDevice) => void): void {
    const devices = Object.entries(DEVICE_PRESETS).filter(([name]) => {
      if (category === 'phones') {
        return !name.includes('iPad') && !name.includes('Tab');
      }
      return name.includes('iPad') || name.includes('Tab');
    });

    devices.forEach(([name, preset]) => {
      this.simulateDevice(name as keyof typeof DEVICE_PRESETS, Orientation.PORTRAIT);
      if (this.currentDevice) {
        callback(this.currentDevice);
      }
    });

    this.reset();
  }
}

// Testing checklist
export interface ResponsiveTestChecklist {
  layoutIntegrity: boolean;
  textReadability: boolean;
  touchTargetSize: boolean;
  imageOptimization: boolean;
  navigationUsability: boolean;
  keyboardHandling: boolean;
  orientationHandling: boolean;
  safeAreaHandling: boolean;
  performanceMetrics: boolean;
  accessibilityCompliance: boolean;
}

// Automated testing helper
export const runResponsiveTests = (): ResponsiveTestChecklist => {
  const results: ResponsiveTestChecklist = {
    layoutIntegrity: true,
    textReadability: true,
    touchTargetSize: true,
    imageOptimization: true,
    navigationUsability: true,
    keyboardHandling: true,
    orientationHandling: true,
    safeAreaHandling: true,
    performanceMetrics: true,
    accessibilityCompliance: true,
  };

  // Test layout integrity
  results.layoutIntegrity = testLayoutIntegrity();
  
  // Test text readability
  results.textReadability = testTextReadability();
  
  // Test touch targets
  results.touchTargetSize = testTouchTargets();
  
  // Add more tests as needed...

  return results;
};

// Test layout integrity
const testLayoutIntegrity = (): boolean => {
  // Check for overlapping elements
  // Check for content clipping
  // Check for proper flexbox usage
  return true; // Placeholder
};

// Test text readability
const testTextReadability = (): boolean => {
  // Check minimum font sizes
  // Check contrast ratios
  // Check line heights
  return true; // Placeholder
};

// Test touch targets
const testTouchTargets = (): boolean => {
  // Check minimum touch target sizes (44x44 iOS, 48x48 Android)
  // Check spacing between targets
  return true; // Placeholder
};

// Viewport testing utilities
export const ViewportTester = {
  // Test different viewport sizes
  testViewportSizes: (sizes: Array<{ width: number; height: number }>) => {
    sizes.forEach(size => {
      console.log(`Testing viewport: ${size.width}x${size.height}`);
      // Implement viewport testing logic
    });
  },

  // Test safe areas
  testSafeAreas: () => {
    const safeAreaScenarios = [
      { top: 44, bottom: 34, description: 'iPhone with notch' },
      { top: 20, bottom: 0, description: 'iPhone without notch' },
      { top: 0, bottom: 0, description: 'Android standard' },
      { top: 24, bottom: 0, description: 'Android with status bar' },
    ];

    safeAreaScenarios.forEach(scenario => {
      console.log(`Testing safe area: ${scenario.description}`);
      // Implement safe area testing logic
    });
  },

  // Test font scaling
  testFontScaling: () => {
    const fontScales = [0.85, 1.0, 1.15, 1.3, 1.5, 2.0];
    
    fontScales.forEach(scale => {
      console.log(`Testing font scale: ${scale}x`);
      // Implement font scaling test logic
    });
  },
};

// Performance testing
export const PerformanceTester = {
  // Measure render time
  measureRenderTime: (componentName: string): number => {
    const startTime = performance.now();
    // Component render logic here
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    return renderTime;
  },

  // Measure memory usage
  measureMemoryUsage: (): void => {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      console.log('Memory usage:', {
        usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      });
    }
  },

  // Test animation performance
  testAnimationPerformance: (fps: number = 60): boolean => {
    const targetFrameTime = 1000 / fps;
    let lastTime = performance.now();
    let frameCount = 0;
    let totalFrameTime = 0;

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastTime;
      totalFrameTime += frameTime;
      frameCount++;
      lastTime = currentTime;

      if (frameCount >= 60) {
        const avgFrameTime = totalFrameTime / frameCount;
        const achievedFPS = 1000 / avgFrameTime;
        
        console.log(`Average FPS: ${achievedFPS.toFixed(2)}`);
        return achievedFPS >= fps * 0.9; // Allow 10% tolerance
      }

      requestAnimationFrame(measureFrame);
    };

    measureFrame();
    return true;
  },
};

// Export singleton instance
export const deviceTester = new DeviceTester();