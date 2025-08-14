import { InteractionManager, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { DeviceInfo, PerformanceConfig } from '@/types/responsive';
import { getDeviceInfo } from './responsive';

// Performance configuration based on device capabilities
export const getPerformanceConfig = async (): Promise<PerformanceConfig> => {
  const deviceInfo = getDeviceInfo();
  const netInfo = await NetInfo.fetch();
  
  // Check connection quality
  const connectionQuality = getConnectionQuality(netInfo);
  
  // Determine if device is low-end
  const isLowEnd = isLowEndDevice(deviceInfo);
  
  return {
    enableAnimations: !isLowEnd && connectionQuality !== 'poor',
    imageQuality: getImageQuality(connectionQuality, isLowEnd),
    loadingStrategy: getLoadingStrategy(connectionQuality),
    cacheImages: true,
    reducedMotion: isLowEnd || deviceInfo.pixelRatio < 2,
  };
};

// Determine connection quality
const getConnectionQuality = (netInfo: any): 'excellent' | 'good' | 'moderate' | 'poor' => {
  if (!netInfo.isConnected) return 'poor';
  
  const { type, effectiveType } = netInfo;
  
  if (type === 'wifi') {
    return 'excellent';
  }
  
  if (type === 'cellular') {
    switch (effectiveType) {
      case '4g':
        return 'good';
      case '3g':
        return 'moderate';
      default:
        return 'poor';
    }
  }
  
  return 'moderate';
};

// Check if device is low-end
const isLowEndDevice = (deviceInfo: DeviceInfo): boolean => {
  // Consider device low-end if:
  // - Small phone with low pixel ratio
  // - Low pixel density
  // - Older platform version
  return (
    (deviceInfo.deviceSize === 'small_phone' && deviceInfo.pixelRatio < 2) ||
    deviceInfo.screenDensity === 'mdpi' ||
    deviceInfo.screenDensity === 'hdpi'
  );
};

// Get optimal image quality
const getImageQuality = (
  connectionQuality: string,
  isLowEnd: boolean
): 'low' | 'medium' | 'high' => {
  if (isLowEnd || connectionQuality === 'poor') return 'low';
  if (connectionQuality === 'moderate') return 'medium';
  return 'high';
};

// Get loading strategy
const getLoadingStrategy = (
  connectionQuality: string
): 'lazy' | 'eager' | 'progressive' => {
  switch (connectionQuality) {
    case 'excellent':
      return 'eager';
    case 'good':
      return 'progressive';
    default:
      return 'lazy';
  }
};

// Defer heavy operations until after interactions
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      lastCall = Date.now();
      func(...args);
    }, delay - (now - lastCall));
  }) as T;
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T;
};

// Memory-efficient batch processing
export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delay: number = 100
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    // Add delay between batches to prevent blocking
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

// Lazy load component
export const lazyLoadComponent = (
  componentLoader: () => Promise<any>,
  delay: number = 0
): Promise<any> => {
  return new Promise((resolve) => {
    if (delay > 0) {
      setTimeout(() => {
        componentLoader().then(resolve);
      }, delay);
    } else {
      InteractionManager.runAfterInteractions(() => {
        componentLoader().then(resolve);
      });
    }
  });
};

// Check if should reduce animations
export const shouldReduceAnimations = async (): Promise<boolean> => {
  const performanceConfig = await getPerformanceConfig();
  return !performanceConfig.enableAnimations || performanceConfig.reducedMotion;
};

// Get optimal batch size based on device
export const getOptimalBatchSize = (deviceInfo: DeviceInfo): number => {
  if (deviceInfo.isTablet) return 20;
  if (deviceInfo.deviceSize === 'large_phone') return 15;
  if (deviceInfo.deviceSize === 'standard_phone') return 10;
  return 5; // Small phone
};

// Cache manager for performance
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private maxSize: number = 100;
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  setMaxSize(size: number): void {
    this.maxSize = size;
  }

  setTTL(ttl: number): void {
    this.ttl = ttl;
  }
}

export const cacheManager = new CacheManager();

// Request animation frame wrapper
export const requestAnimationFrameWrapper = (callback: () => void): number => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.requestAnimationFrame(callback);
  }
  
  // Fallback for React Native
  return setTimeout(callback, 16); // ~60fps
};

// Cancel animation frame wrapper
export const cancelAnimationFrameWrapper = (id: number): void => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
};

// Optimize list rendering
export const getOptimalListConfig = (deviceInfo: DeviceInfo) => {
  const isLowEnd = isLowEndDevice(deviceInfo);
  
  return {
    initialNumToRender: isLowEnd ? 5 : 10,
    maxToRenderPerBatch: isLowEnd ? 3 : 5,
    updateCellsBatchingPeriod: isLowEnd ? 100 : 50,
    windowSize: isLowEnd ? 5 : 10,
    removeClippedSubviews: Platform.OS === 'android',
    getItemLayout: undefined, // Should be implemented per list
  };
};

// Network-aware data fetching
export const fetchWithNetworkAwareness = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  const netInfo = await NetInfo.fetch();
  const connectionQuality = getConnectionQuality(netInfo);
  
  // Adjust timeout based on connection quality
  const timeout = connectionQuality === 'poor' ? 30000 : 
                  connectionQuality === 'moderate' ? 20000 : 10000;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};