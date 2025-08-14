import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TestUtils } from '@/utils/testing';
import { RootState } from '@/store/store';

// Mock Redux Store Configuration
interface MockStoreConfig {
  preloadedState?: Partial<RootState>;
  reducers?: Record<string, any>;
}

export const createMockStore = (config: MockStoreConfig = {}) => {
  const mockStore = configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false, user: null }) => state,
      user: (state = { profile: null, matches: [], chats: [] }) => state,
      theme: (state = { isDarkMode: true, colors: {} }) => state,
      swipe: (state = { queue: [], dailyCount: 0, limit: 100 }) => state,
      discover: (state = { users: [], filters: {}, viewMode: 'stack' }) => state,
      chat: (state = { chats: [], activeChat: null, typing: {} }) => state,
      settings: (state = { notifications: true, privacy: {} }) => state,
      analytics: (state = { events: [], metrics: {} }) => state,
      ...config.reducers,
    },
    preloadedState: config.preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });

  return mockStore;
};

// Custom Render Function with Providers
interface CustomRenderOptions extends RenderOptions {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createMockStore>;
  navigationOptions?: {
    initialRouteName?: string;
    initialParams?: any;
  };
  themeMode?: 'light' | 'dark';
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    preloadedState = {},
    store = createMockStore({ preloadedState }),
    navigationOptions = {},
    themeMode = 'dark',
    ...renderOptions
  } = options;

  const mockNavigation = TestUtils.createMockNavigation();
  const mockRoute = TestUtils.createMockRoute(navigationOptions.initialParams);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <Provider store={store}>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 375, height: 812 },
            insets: { top: 44, left: 0, right: 0, bottom: 34 },
          }}
        >
          <ThemeProvider>
            <NavigationContainer>
              {children}
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    );
  };

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    store,
    navigation: mockNavigation,
    route: mockRoute,
    ...renderResult,
  };
};

// Screen Testing Helpers
export const screenTestHelpers = {
  expectHeaderTitle: (getByText: any, title: string) => {
    expect(getByText(title)).toBeTruthy();
  },

  expectLoadingState: (queryByTestId: any) => {
    expect(queryByTestId('loading-indicator')).toBeTruthy();
  },

  expectErrorState: (getByText: any, errorMessage: string) => {
    expect(getByText(errorMessage)).toBeTruthy();
  },

  expectEmptyState: (getByText: any, emptyMessage: string) => {
    expect(getByText(emptyMessage)).toBeTruthy();
  },

  expectNavigationCall: (mockNavigation: any, screen: string, params?: any) => {
    if (params) {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(screen, params);
    } else {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(screen);
    }
  },

  expectBackNavigation: (mockNavigation: any) => {
    expect(mockNavigation.goBack).toHaveBeenCalled();
  },
};

// Component Testing Helpers
export const componentTestHelpers = {
  expectButtonToBeEnabled: (getByTestId: any, testId: string) => {
    const button = getByTestId(testId);
    expect(button.props.disabled).toBeFalsy();
  },

  expectButtonToBeDisabled: (getByTestId: any, testId: string) => {
    const button = getByTestId(testId);
    expect(button.props.disabled).toBeTruthy();
  },

  expectInputValue: (getByTestId: any, testId: string, value: string) => {
    const input = getByTestId(testId);
    expect(input.props.value).toBe(value);
  },

  expectModalVisible: (getByTestId: any, testId: string) => {
    const modal = getByTestId(testId);
    expect(modal.props.visible).toBeTruthy();
  },

  expectModalHidden: (queryByTestId: any, testId: string) => {
    const modal = queryByTestId(testId);
    expect(modal?.props.visible).toBeFalsy();
  },

  expectImageSource: (getByTestId: any, testId: string, source: any) => {
    const image = getByTestId(testId);
    expect(image.props.source).toEqual(source);
  },
};

// Form Testing Helpers
export const formTestHelpers = {
  fillInput: async (getByTestId: any, fireEvent: any, testId: string, value: string) => {
    const input = getByTestId(testId);
    fireEvent.changeText(input, value);
  },

  submitForm: async (getByTestId: any, fireEvent: any, submitButtonTestId: string) => {
    const submitButton = getByTestId(submitButtonTestId);
    fireEvent.press(submitButton);
  },

  expectValidationError: (getByText: any, errorMessage: string) => {
    expect(getByText(errorMessage)).toBeTruthy();
  },

  expectFormSubmission: (mockFn: jest.Mock, expectedData: any) => {
    expect(mockFn).toHaveBeenCalledWith(expectedData);
  },
};

// List Testing Helpers
export const listTestHelpers = {
  expectListItem: (getByTestId: any, testId: string) => {
    expect(getByTestId(testId)).toBeTruthy();
  },

  expectListLength: (getAllByTestId: any, testId: string, expectedLength: number) => {
    const items = getAllByTestId(testId);
    expect(items).toHaveLength(expectedLength);
  },

  scrollToEnd: async (getByTestId: any, fireEvent: any, listTestId: string) => {
    const list = getByTestId(listTestId);
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { y: 1000, x: 0 },
        contentSize: { height: 2000, width: 375 },
        layoutMeasurement: { height: 812, width: 375 },
      },
    });
  },

  expectLoadMoreCalled: (mockFn: jest.Mock) => {
    expect(mockFn).toHaveBeenCalled();
  },
};

// Animation Testing Helpers
export const animationTestHelpers = {
  expectAnimationStart: (mockAnimated: any) => {
    expect(mockAnimated.start).toHaveBeenCalled();
  },

  expectAnimationValue: (animatedValue: any, expectedValue: number) => {
    expect(animatedValue._value).toBe(expectedValue);
  },

  completeAnimation: (mockAnimated: any) => {
    const callback = mockAnimated.start.mock.calls[0][0];
    if (callback) callback({ finished: true });
  },
};

// Accessibility Testing Helpers
export const accessibilityTestHelpers = {
  expectAccessibilityLabel: (getByTestId: any, testId: string, label: string) => {
    const element = getByTestId(testId);
    expect(element.props.accessibilityLabel).toBe(label);
  },

  expectAccessibilityRole: (getByTestId: any, testId: string, role: string) => {
    const element = getByTestId(testId);
    expect(element.props.accessibilityRole).toBe(role);
  },

  expectAccessibilityHint: (getByTestId: any, testId: string, hint: string) => {
    const element = getByTestId(testId);
    expect(element.props.accessibilityHint).toBe(hint);
  },

  expectAccessibilityState: (getByTestId: any, testId: string, state: any) => {
    const element = getByTestId(testId);
    expect(element.props.accessibilityState).toEqual(state);
  },
};

// Mock API Helpers
export const mockApiHelpers = {
  setupSuccessResponse: (mockFetch: jest.Mock, data: any) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data }),
    });
  },

  setupErrorResponse: (mockFetch: jest.Mock, error: string, status: number = 400) => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status,
      json: () => Promise.resolve({ success: false, error }),
    });
  },

  setupNetworkError: (mockFetch: jest.Mock) => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
  },

  expectApiCall: (mockFetch: jest.Mock, url: string, options?: any) => {
    if (options) {
      expect(mockFetch).toHaveBeenCalledWith(url, options);
    } else {
      expect(mockFetch).toHaveBeenCalledWith(url);
    }
  },
};

// Testing Matchers
export const customMatchers = {
  toBeWithinRange: (received: number, floor: number, ceiling: number) => {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },

  toHaveBeenCalledWithPartial: (mockFn: jest.Mock, expectedPartial: any) => {
    const calls = mockFn.mock.calls;
    const found = calls.some(call =>
      call.some(arg => 
        typeof arg === 'object' && 
        Object.keys(expectedPartial).every(key => arg[key] === expectedPartial[key])
      )
    );
    
    return {
      message: () => 
        `expected mock function ${found ? 'not ' : ''}to have been called with partial object ${JSON.stringify(expectedPartial)}`,
      pass: found,
    };
  },
};

// Test Setup and Teardown
export const testSetup = {
  beforeEach: () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset test data factory counters
    // TestDataFactory.resetCounters();
    
    // Mock console methods to reduce test noise
    global.console.warn = jest.fn();
    global.console.error = jest.fn();
  },

  afterEach: () => {
    // Clean up any test data
    jest.restoreAllMocks();
  },

  setupMocks: () => {
    // Mock React Native modules
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      NativeModules: {
        ...jest.requireActual('react-native').NativeModules,
        RNDeviceInfo: {
          getUniqueId: () => 'test-device-id',
          getDeviceId: () => 'test-device',
          getSystemVersion: () => '14.0',
        },
      },
      Platform: {
        OS: 'ios',
        Version: '14.0',
        select: jest.fn(obj => obj.ios),
      },
      Dimensions: {
        get: jest.fn(() => ({ width: 375, height: 812 })),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    }));

    // Mock AsyncStorage
    const mockAsyncStorage = TestUtils.mockAsyncStorage();
    jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

    // Mock Image Picker
    const mockImagePicker = TestUtils.mockImagePicker();
    jest.mock('react-native-image-picker', () => mockImagePicker);

    // Mock Geolocation
    const mockGeolocation = TestUtils.mockGeolocation();
    global.navigator.geolocation = mockGeolocation;

    // Mock Push Notifications
    const mockPushNotifications = TestUtils.mockPushNotifications();
    jest.mock('@react-native-firebase/messaging', () => () => mockPushNotifications);
  },
};

export default {
  renderWithProviders,
  createMockStore,
  screenTestHelpers,
  componentTestHelpers,
  formTestHelpers,
  listTestHelpers,
  animationTestHelpers,
  accessibilityTestHelpers,
  mockApiHelpers,
  customMatchers,
  testSetup,
};