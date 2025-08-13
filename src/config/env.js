import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Development environment variables (fallback)
const DEV_CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api/v1',
  SOCKET_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
  DEBUG_MODE: true,
};

// Get environment variables from Expo Constants
const ENV = Constants.expoConfig?.extra || {};

// Helper function to get environment variable with fallback
const getEnvVar = (key, defaultValue = '') => {
  // Try to get from process.env first (for web)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Then from Constants.expoConfig.extra
  if (ENV[key] !== undefined) {
    return ENV[key];
  }
  
  // Fallback to default value
  return defaultValue;
};

// Helper to parse boolean environment variables
const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return defaultValue;
};

// Helper to parse number environment variables
const parseNumber = (value, defaultValue = 0) => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Configuration object
const Config = {
  // API Configuration
  API_BASE_URL: getEnvVar('API_BASE_URL', DEV_CONFIG.API_BASE_URL),
  SOCKET_URL: getEnvVar('SOCKET_URL', DEV_CONFIG.SOCKET_URL),
  
  // Environment
  NODE_ENV: getEnvVar('NODE_ENV', DEV_CONFIG.NODE_ENV),
  IS_DEV: getEnvVar('NODE_ENV', DEV_CONFIG.NODE_ENV) === 'development',
  IS_PROD: getEnvVar('NODE_ENV', DEV_CONFIG.NODE_ENV) === 'production',
  
  // App Configuration
  APP_NAME: getEnvVar('APP_NAME', 'Pairity'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  APP_BUILD: getEnvVar('APP_BUILD', '1'),
  
  // Payment Gateway
  RAZORPAY_KEY_ID: getEnvVar('RAZORPAY_KEY_ID', ''),
  RAZORPAY_KEY_SECRET: getEnvVar('RAZORPAY_KEY_SECRET', ''),
  RAZORPAY_WEBHOOK_SECRET: getEnvVar('RAZORPAY_WEBHOOK_SECRET', ''),
  
  // Push Notifications
  EXPO_PUSH_TOKEN: getEnvVar('EXPO_PUSH_TOKEN', ''),
  FCM_SERVER_KEY: getEnvVar('FCM_SERVER_KEY', ''),
  
  // Social Login
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET', ''),
  APPLE_CLIENT_ID: getEnvVar('APPLE_CLIENT_ID', ''),
  APPLE_TEAM_ID: getEnvVar('APPLE_TEAM_ID', ''),
  
  // Analytics
  MIXPANEL_TOKEN: getEnvVar('MIXPANEL_TOKEN', ''),
  AMPLITUDE_API_KEY: getEnvVar('AMPLITUDE_API_KEY', ''),
  SENTRY_DSN: getEnvVar('SENTRY_DSN', ''),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: getEnvVar('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: getEnvVar('AWS_SECRET_ACCESS_KEY', ''),
  AWS_REGION: getEnvVar('AWS_REGION', 'ap-south-1'),
  AWS_S3_BUCKET: getEnvVar('AWS_S3_BUCKET', ''),
  
  // Maps
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY', ''),
  
  // Feature Flags
  FEATURES: {
    SOCIAL_LOGIN: parseBoolean(getEnvVar('ENABLE_SOCIAL_LOGIN', 'false')),
    VIDEO_PROFILES: parseBoolean(getEnvVar('ENABLE_VIDEO_PROFILES', 'false')),
    VOICE_NOTES: parseBoolean(getEnvVar('ENABLE_VOICE_NOTES', 'true')),
    VIDEO_CALLS: parseBoolean(getEnvVar('ENABLE_VIDEO_CALLS', 'false')),
    ANALYTICS: parseBoolean(getEnvVar('ENABLE_ANALYTICS', 'false')),
    CRASH_REPORTING: parseBoolean(getEnvVar('ENABLE_CRASH_REPORTING', 'false')),
  },
  
  // Rate Limiting
  LIMITS: {
    MAX_SWIPES_PER_DAY: parseNumber(getEnvVar('MAX_SWIPES_PER_DAY', '100')),
    MAX_MESSAGES_PER_MINUTE: parseNumber(getEnvVar('MAX_MESSAGES_PER_MINUTE', '10')),
    MAX_SUPER_LIKES_PER_DAY: parseNumber(getEnvVar('MAX_SUPER_LIKES_PER_DAY', '3')),
  },
  
  // Subscription Pricing
  PRICING: {
    MONTHLY: parseNumber(getEnvVar('SUBSCRIPTION_PRICE_MONTHLY', '5000')),
    QUARTERLY: parseNumber(getEnvVar('SUBSCRIPTION_PRICE_QUARTERLY', '13500')),
    YEARLY: parseNumber(getEnvVar('SUBSCRIPTION_PRICE_YEARLY', '48000')),
  },
  
  // Queue Configuration
  QUEUE: {
    DAILY_SIZE: parseNumber(getEnvVar('DAILY_QUEUE_SIZE', '10')),
    REFRESH_HOUR: parseNumber(getEnvVar('QUEUE_REFRESH_HOUR', '0')),
  },
  
  // Match Configuration
  MATCH: {
    EXPIRY_HOURS: parseNumber(getEnvVar('MATCH_EXPIRY_HOURS', '48')),
    ALLOW_EXTENSION: parseBoolean(getEnvVar('ALLOW_MATCH_EXTENSION', 'true')),
  },
  
  // Debug Options
  DEBUG: {
    MODE: parseBoolean(getEnvVar('DEBUG_MODE', 'false')),
    REDUX_DEVTOOLS: parseBoolean(getEnvVar('SHOW_REDUX_DEVTOOLS', 'true')),
    LOG_API_CALLS: parseBoolean(getEnvVar('LOG_API_CALLS', 'true')),
    LOG_SOCKET_EVENTS: parseBoolean(getEnvVar('LOG_SOCKET_EVENTS', 'false')),
  },
  
  // Test Accounts
  TEST_ACCOUNTS: {
    MALE_EMAIL: getEnvVar('TEST_MALE_EMAIL', 'male@test.com'),
    MALE_PASSWORD: getEnvVar('TEST_MALE_PASSWORD', 'password123'),
    FEMALE_EMAIL: getEnvVar('TEST_FEMALE_EMAIL', 'female@test.com'),
    FEMALE_PASSWORD: getEnvVar('TEST_FEMALE_PASSWORD', 'password123'),
    OTP: getEnvVar('TEST_OTP', '123456'),
  },
  
  // Platform specific
  PLATFORM: {
    IS_IOS: Platform.OS === 'ios',
    IS_ANDROID: Platform.OS === 'android',
    IS_WEB: Platform.OS === 'web',
  },
};

// Validate required environment variables
const validateConfig = () => {
  const required = ['API_BASE_URL'];
  const missing = required.filter(key => !Config[key]);
  
  if (missing.length > 0 && Config.IS_PROD) {
    console.error('Missing required environment variables:', missing);
  }
};

// Run validation
validateConfig();

export default Config;