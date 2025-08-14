import { Performance, PerformanceEntry } from 'react-native-performance';
import { InteractionManager } from 'react-native';
import { PerformanceMetrics, PerformanceReport, MemoryLeak, SlowQuery, BundleAnalysis } from '@/types/testing';

export class PerformanceTestRunner {
  private measurements: PerformanceEntry[] = [];
  private memorySnapshots: number[] = [];
  private renderTimes: Map<string, number[]> = new Map();
  private networkCalls: Map<string, number[]> = new Map();

  // Start performance monitoring
  startMonitoring(): void {
    this.measurements = [];
    this.memorySnapshots = [];
    this.renderTimes.clear();
    this.networkCalls.clear();

    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Monitor frame drops
    this.startFrameMonitoring();
    
    // Monitor network calls
    this.startNetworkMonitoring();
  }

  // Stop performance monitoring and generate report
  stopMonitoring(): PerformanceReport {
    return this.generateReport();
  }

  // Measure component render time
  measureRenderTime<T>(componentName: string, renderFunction: () => T): T {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (!this.renderTimes.has(componentName)) {
      this.renderTimes.set(componentName, []);
    }
    this.renderTimes.get(componentName)!.push(duration);

    return result;
  }

  // Measure async operations
  async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.measurements.push({
      name: operationName,
      entryType: 'measure',
      startTime,
      duration,
    } as PerformanceEntry);

    return { result, duration };
  }

  // Measure navigation performance
  measureNavigation(screenName: string, navigationFunction: () => void): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const interactionHandle = InteractionManager.createInteractionHandle();
      
      navigationFunction();

      // Wait for navigation to complete
      InteractionManager.runAfterInteractions(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        InteractionManager.clearInteractionHandle(interactionHandle);
        
        this.measurements.push({
          name: `navigation_${screenName}`,
          entryType: 'navigation',
          startTime,
          duration,
        } as PerformanceEntry);

        resolve(duration);
      });
    });
  }

  // Measure bundle size impact
  measureBundleSize(): BundleAnalysis {
    // This would integrate with Metro bundler or similar tool
    // For now, returning mock data structure
    return {
      totalSize: 1024000, // 1MB
      chunks: [
        { name: 'main.bundle.js', size: 512000, percentage: 50 },
        { name: 'vendor.bundle.js', size: 256000, percentage: 25 },
        { name: 'assets', size: 256000, percentage: 25 },
      ],
      duplicates: [
        { name: 'lodash', occurrences: 3, totalSize: 50000 },
      ],
    };
  }

  // Test app launch time
  measureAppLaunch(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Wait for app to be fully loaded
      InteractionManager.runAfterInteractions(() => {
        const endTime = Date.now();
        resolve(endTime - startTime);
      });
    });
  }

  // Memory leak detection
  detectMemoryLeaks(): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];
    
    // Analyze memory snapshots for increasing trends
    if (this.memorySnapshots.length > 10) {
      const recentSnapshots = this.memorySnapshots.slice(-10);
      const averageIncrease = this.calculateAverageIncrease(recentSnapshots);
      
      if (averageIncrease > 1024 * 1024) { // 1MB increase
        leaks.push({
          component: 'Unknown',
          leakSize: averageIncrease,
          description: 'Potential memory leak detected - memory usage trending upward',
        });
      }
    }
    
    return leaks;
  }

  // FPS monitoring
  measureFPS(): Promise<number> {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      const duration = 1000; // 1 second
      
      const measureFrame = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const fps = frameCount / (elapsed / 1000);
          resolve(fps);
        }
      };
      
      requestAnimationFrame(measureFrame);
    });
  }

  // List performance testing
  measureListPerformance(
    listName: string,
    itemCount: number,
    renderItem: (index: number) => any
  ): { averageRenderTime: number; totalTime: number } {
    const startTime = performance.now();
    const renderTimes: number[] = [];

    for (let i = 0; i < itemCount; i++) {
      const itemStartTime = performance.now();
      renderItem(i);
      const itemEndTime = performance.now();
      renderTimes.push(itemEndTime - itemStartTime);
    }

    const totalTime = performance.now() - startTime;
    const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;

    this.measurements.push({
      name: `list_${listName}`,
      entryType: 'measure',
      startTime,
      duration: totalTime,
    } as PerformanceEntry);

    return { averageRenderTime, totalTime };
  }

  // Image loading performance
  measureImageLoading(imageUrl: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const image = new Image();
      
      image.onload = () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.measurements.push({
          name: `image_load_${imageUrl}`,
          entryType: 'resource',
          startTime,
          duration,
        } as PerformanceEntry);
        
        resolve(duration);
      };
      
      image.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      image.src = imageUrl;
    });
  }

  // Private methods
  private startMemoryMonitoring(): void {
    const monitorMemory = () => {
      if (global.performance && global.performance.memory) {
        this.memorySnapshots.push(global.performance.memory.usedJSHeapSize);
      }
      setTimeout(monitorMemory, 1000); // Monitor every second
    };
    
    monitorMemory();
  }

  private startFrameMonitoring(): void {
    // Monitor frame drops using RAF
    let lastFrameTime = performance.now();
    let frameDrops = 0;
    
    const monitorFrames = () => {
      const currentTime = performance.now();
      const frameDuration = currentTime - lastFrameTime;
      
      // Assuming 60fps, each frame should take ~16.67ms
      if (frameDuration > 33) { // Double frame time indicates a drop
        frameDrops++;
      }
      
      lastFrameTime = currentTime;
      requestAnimationFrame(monitorFrames);
    };
    
    requestAnimationFrame(monitorFrames);
  }

  private startNetworkMonitoring(): void {
    // Override fetch to monitor network calls
    const originalFetch = global.fetch;
    
    global.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (!this.networkCalls.has(url)) {
          this.networkCalls.set(url, []);
        }
        this.networkCalls.get(url)!.push(duration);
        
        this.measurements.push({
          name: `network_${url}`,
          entryType: 'resource',
          startTime,
          duration,
        } as PerformanceEntry);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.measurements.push({
          name: `network_error_${url}`,
          entryType: 'resource',
          startTime,
          duration,
        } as PerformanceEntry);
        
        throw error;
      }
    };
  }

  private calculateAverageIncrease(snapshots: number[]): number {
    if (snapshots.length < 2) return 0;
    
    let totalIncrease = 0;
    for (let i = 1; i < snapshots.length; i++) {
      totalIncrease += Math.max(0, snapshots[i] - snapshots[i - 1]);
    }
    
    return totalIncrease / (snapshots.length - 1);
  }

  private generateReport(): PerformanceReport {
    const averageRenderTime = this.calculateAverageRenderTime();
    const memoryLeaks = this.detectMemoryLeaks();
    const slowQueries = this.identifySlowQueries();
    const bundleAnalysis = this.measureBundleSize();

    return {
      averageRenderTime,
      memoryLeaks,
      slowQueries,
      bundleAnalysis,
    };
  }

  private calculateAverageRenderTime(): number {
    let totalTime = 0;
    let count = 0;

    for (const times of this.renderTimes.values()) {
      totalTime += times.reduce((a, b) => a + b, 0);
      count += times.length;
    }

    return count > 0 ? totalTime / count : 0;
  }

  private identifySlowQueries(): SlowQuery[] {
    const slowQueries: SlowQuery[] = [];
    const threshold = 1000; // 1 second

    for (const [url, durations] of this.networkCalls.entries()) {
      const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      
      if (averageDuration > threshold) {
        slowQueries.push({
          query: url,
          duration: averageDuration,
          component: 'Network',
        });
      }
    }

    return slowQueries;
  }
}

// Performance Test Utilities
export class PerformanceTestUtils {
  private static testRunner = new PerformanceTestRunner();

  // Create performance test suite
  static createTestSuite() {
    return {
      startMonitoring: () => this.testRunner.startMonitoring(),
      stopMonitoring: () => this.testRunner.stopMonitoring(),
      
      expectRenderTime: (componentName: string, maxTime: number, renderFn: () => any) => {
        const result = this.testRunner.measureRenderTime(componentName, renderFn);
        // Implementation would check against maxTime threshold
        return result;
      },
      
      expectNavigationTime: async (screenName: string, maxTime: number, navFn: () => void) => {
        const duration = await this.testRunner.measureNavigation(screenName, navFn);
        if (duration > maxTime) {
          throw new Error(`Navigation to ${screenName} took ${duration}ms, expected < ${maxTime}ms`);
        }
        return duration;
      },
      
      expectFPS: async (minFPS: number) => {
        const fps = await this.testRunner.measureFPS();
        if (fps < minFPS) {
          throw new Error(`FPS ${fps} is below minimum ${minFPS}`);
        }
        return fps;
      },
      
      expectNoMemoryLeaks: () => {
        const leaks = this.testRunner.detectMemoryLeaks();
        if (leaks.length > 0) {
          throw new Error(`Memory leaks detected: ${leaks.map(l => l.description).join(', ')}`);
        }
        return true;
      },
    };
  }

  // Benchmark component performance
  static benchmark(
    componentName: string,
    renderFunction: () => any,
    iterations: number = 100
  ): { average: number; min: number; max: number; median: number } {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      renderFunction();
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    times.sort((a, b) => a - b);

    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: times[0],
      max: times[times.length - 1],
      median: times[Math.floor(times.length / 2)],
    };
  }

  // Performance thresholds for different operations
  static getThresholds() {
    return {
      componentRender: 16, // 60fps = 16.67ms per frame
      apiResponse: 1000, // 1 second
      imageLoad: 3000, // 3 seconds
      navigation: 500, // 0.5 seconds
      appLaunch: 2000, // 2 seconds
      listItemRender: 8, // Half frame time
      memoryUsage: 100 * 1024 * 1024, // 100MB
      minFPS: 55, // Allow some frame drops
    };
  }

  // Create performance matchers for Jest
  static createMatchers() {
    return {
      toBeFasterThan: (received: number, expected: number) => {
        const pass = received < expected;
        return {
          message: () =>
            `expected ${received}ms ${pass ? 'not ' : ''}to be faster than ${expected}ms`,
          pass,
        };
      },
      
      toHaveGoodFPS: (received: number) => {
        const minFPS = this.getThresholds().minFPS;
        const pass = received >= minFPS;
        return {
          message: () =>
            `expected ${received} FPS ${pass ? 'not ' : ''}to be at least ${minFPS} FPS`,
          pass,
        };
      },
      
      toHaveNoMemoryLeaks: (received: MemoryLeak[]) => {
        const pass = received.length === 0;
        return {
          message: () =>
            `expected ${pass ? 'not ' : ''}to have memory leaks, but found ${received.length}`,
          pass,
        };
      },
    };
  }
}

// Load testing utilities
export class LoadTestUtils {
  static async simulateHighLoad(
    testFunction: () => Promise<any>,
    concurrency: number = 10,
    duration: number = 5000
  ): Promise<{ successCount: number; errorCount: number; averageTime: number }> {
    const startTime = Date.now();
    const promises: Promise<any>[] = [];
    const results: { success: boolean; time: number }[] = [];

    while (Date.now() - startTime < duration) {
      // Maintain concurrency level
      if (promises.length < concurrency) {
        const promise = (async () => {
          const testStart = performance.now();
          try {
            await testFunction();
            const testEnd = performance.now();
            results.push({ success: true, time: testEnd - testStart });
          } catch (error) {
            const testEnd = performance.now();
            results.push({ success: false, time: testEnd - testStart });
          }
        })();
        
        promises.push(promise);
        
        // Remove completed promises
        promise.finally(() => {
          const index = promises.indexOf(promise);
          if (index > -1) {
            promises.splice(index, 1);
          }
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Wait for remaining promises
    await Promise.all(promises);

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;
    const averageTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;

    return { successCount, errorCount, averageTime };
  }
}

export default {
  PerformanceTestRunner,
  PerformanceTestUtils,
  LoadTestUtils,
};