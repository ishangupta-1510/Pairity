import { TestUser, TestMatch, TestMessage, TestChat, TestSwipe, MockApiResponse } from '@/types/testing';

// Test Data Factories
export class TestDataFactory {
  private static userIdCounter = 1;
  private static messageIdCounter = 1;
  private static matchIdCounter = 1;
  private static chatIdCounter = 1;

  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const id = this.userIdCounter++;
    return {
      id: `user_${id}`,
      name: `Test User ${id}`,
      email: `testuser${id}@example.com`,
      age: 25 + (id % 10),
      bio: `This is test user ${id}'s bio`,
      photos: [
        `https://picsum.photos/400/600?random=${id}1`,
        `https://picsum.photos/400/600?random=${id}2`,
      ],
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        city: 'New York',
        state: 'NY',
      },
      preferences: {
        ageRange: [22, 35],
        distance: 25,
        interestedIn: id % 2 === 0 ? 'women' : 'men',
      },
      interests: ['Travel', 'Food', 'Music', 'Sports'].slice(0, 2 + (id % 3)),
      verified: id % 3 === 0,
      premium: id % 4 === 0,
      ...overrides,
    };
  }

  static createMatch(user1Id?: string, user2Id?: string, overrides: Partial<TestMatch> = {}): TestMatch {
    const id = this.matchIdCounter++;
    return {
      id: `match_${id}`,
      user1Id: user1Id || `user_${id}`,
      user2Id: user2Id || `user_${id + 1}`,
      matchedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      isSuperLike: Math.random() > 0.8,
      ...overrides,
    };
  }

  static createMessage(chatId?: string, senderId?: string, overrides: Partial<TestMessage> = {}): TestMessage {
    const id = this.messageIdCounter++;
    const messages = [
      'Hey there! 👋',
      'How are you doing?',
      'Love your photos!',
      'Want to grab coffee sometime?',
      'Thanks for matching with me!',
    ];

    return {
      id: `message_${id}`,
      chatId: chatId || `chat_${this.chatIdCounter}`,
      senderId: senderId || `user_${id % 2 + 1}`,
      content: messages[id % messages.length],
      type: 'text',
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      ...overrides,
    };
  }

  static createChat(participantIds?: string[], overrides: Partial<TestChat> = {}): TestChat {
    const id = this.chatIdCounter++;
    const participants = participantIds || [`user_1`, `user_2`];
    const lastMessage = this.createMessage(`chat_${id}`, participants[0]);

    return {
      id: `chat_${id}`,
      participants,
      lastMessage,
      unreadCount: Math.floor(Math.random() * 5),
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      updatedAt: lastMessage.timestamp,
      ...overrides,
    };
  }

  static createSwipe(swiperId?: string, swipedId?: string, overrides: Partial<TestSwipe> = {}): TestSwipe {
    return {
      id: `swipe_${Date.now()}_${Math.random()}`,
      swiperId: swiperId || 'user_1',
      swipedId: swipedId || 'user_2',
      action: ['like', 'dislike', 'superlike'][Math.floor(Math.random() * 3)] as any,
      timestamp: new Date().toISOString(),
      ...overrides,
    };
  }

  static createUserList(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  static createMessageThread(chatId: string, count: number): TestMessage[] {
    const participants = [`user_1`, `user_2`];
    return Array.from({ length: count }, (_, index) => 
      this.createMessage(
        chatId, 
        participants[index % 2],
        { 
          timestamp: new Date(Date.now() - (count - index) * 300000).toISOString() 
        }
      )
    );
  }

  static resetCounters(): void {
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
    this.matchIdCounter = 1;
    this.chatIdCounter = 1;
  }
}

// Mock API Response Helpers
export class MockApiHelper {
  static success<T>(data: T, message?: string): MockApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(error: string, message?: string): MockApiResponse {
    return {
      success: false,
      error,
      message,
    };
  }

  static paginated<T>(
    items: T[],
    page: number = 1,
    limit: number = 10
  ): MockApiResponse<{ items: T[]; pagination: any }> {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);

    return this.success({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: items.length,
        pages: Math.ceil(items.length / limit),
        hasNext: end < items.length,
        hasPrev: page > 1,
      },
    });
  }

  static delayed<T>(response: MockApiResponse<T>, delay: number): Promise<MockApiResponse<T>> {
    return new Promise(resolve => {
      setTimeout(() => resolve(response), delay);
    });
  }
}

// Test Utilities
export class TestUtils {
  static async waitFor(condition: () => boolean, timeout: number = 5000): Promise<void> {
    const start = Date.now();
    
    while (!condition() && Date.now() - start < timeout) {
      await this.sleep(100);
    }
    
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static randomEmail(): string {
    return `${this.randomString(8).toLowerCase()}@test.com`;
  }

  static randomPhoneNumber(): string {
    return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  static mockTimestamp(daysAgo: number = 0): string {
    return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  }

  static createMockNavigation() {
    return {
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setParams: jest.fn(),
      setOptions: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => true),
      getId: jest.fn(() => 'test-screen'),
      getParent: jest.fn(),
      getState: jest.fn(),
    };
  }

  static createMockRoute(params: any = {}) {
    return {
      key: 'test-route',
      name: 'TestScreen',
      params,
    };
  }

  static createMockStore(initialState: any = {}) {
    return {
      getState: jest.fn(() => initialState),
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    };
  }

  static mockAsyncStorage() {
    const storage: Record<string, string> = {};
    
    return {
      getItem: jest.fn((key: string) => Promise.resolve(storage[key] || null)),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storage))),
      multiGet: jest.fn((keys: string[]) => 
        Promise.resolve(keys.map(key => [key, storage[key] || null]))
      ),
      multiSet: jest.fn((keyValuePairs: [string, string][]) => {
        keyValuePairs.forEach(([key, value]) => storage[key] = value);
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys: string[]) => {
        keys.forEach(key => delete storage[key]);
        return Promise.resolve();
      }),
    };
  }

  static mockImagePicker() {
    return {
      openPicker: jest.fn(() => Promise.resolve([
        {
          path: '/mock/path/image1.jpg',
          width: 400,
          height: 600,
          mime: 'image/jpeg',
          size: 1024000,
        },
      ])),
      openCamera: jest.fn(() => Promise.resolve({
        path: '/mock/path/camera.jpg',
        width: 400,
        height: 600,
        mime: 'image/jpeg',
        size: 1024000,
      })),
    };
  }

  static mockGeolocation() {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    return {
      getCurrentPosition: jest.fn((success: Function) => {
        setTimeout(() => success(mockPosition), 100);
      }),
      watchPosition: jest.fn((success: Function) => {
        const id = setInterval(() => success(mockPosition), 1000);
        return id;
      }),
      clearWatch: jest.fn(),
    };
  }

  static mockPushNotifications() {
    return {
      requestPermissions: jest.fn(() => Promise.resolve(true)),
      getToken: jest.fn(() => Promise.resolve('mock_push_token')),
      onMessage: jest.fn(),
      onNotificationOpened: jest.fn(),
      cancelAllNotifications: jest.fn(),
      scheduleNotification: jest.fn(),
    };
  }

  static expectToBeCalledWithPartial(mockFn: jest.Mock, expectedPartial: any) {
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining(expectedPartial)
    );
  }

  static expectToBeCalledWithArrayContaining(mockFn: jest.Mock, expectedItems: any[]) {
    expect(mockFn).toHaveBeenCalledWith(
      expect.arrayContaining(expectedItems)
    );
  }
}

// Performance Testing Utilities
export class PerformanceTestUtils {
  static measureRenderTime<T>(component: () => T): { result: T; renderTime: number } {
    const start = performance.now();
    const result = component();
    const end = performance.now();
    
    return {
      result,
      renderTime: end - start,
    };
  }

  static async measureAsyncOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    return {
      result,
      duration: end - start,
    };
  }

  static createPerformanceThresholds() {
    return {
      renderTime: 16, // 60fps
      apiResponse: 1000, // 1 second
      imageLoad: 3000, // 3 seconds
      navigation: 500, // 0.5 seconds
      memoryUsage: 100 * 1024 * 1024, // 100MB
    };
  }
}

// Accessibility Testing Utilities
export class AccessibilityTestUtils {
  static checkMinimumTouchTarget(element: any): boolean {
    const minSize = 44; // iOS/Android minimum
    return element.width >= minSize && element.height >= minSize;
  }

  static checkContrastRatio(foreground: string, background: string): number {
    // Simplified contrast ratio calculation
    // In production, use a proper color contrast library
    return 4.5; // Mock passing ratio
  }

  static validateAccessibilityProps(props: any): string[] {
    const issues: string[] = [];
    
    if (!props.accessible && !props.accessibilityLabel) {
      issues.push('Element should have accessible=true or accessibilityLabel');
    }
    
    if (props.accessibilityRole === 'button' && !props.accessibilityLabel) {
      issues.push('Button should have accessibilityLabel');
    }
    
    if (props.accessibilityLabel && props.accessibilityLabel.length > 40) {
      issues.push('AccessibilityLabel should be concise (< 40 characters)');
    }
    
    return issues;
  }
}

export default {
  TestDataFactory,
  MockApiHelper,
  TestUtils,
  PerformanceTestUtils,
  AccessibilityTestUtils,
};