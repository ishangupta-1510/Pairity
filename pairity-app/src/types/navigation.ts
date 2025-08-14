import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
};

// Main Tab Types
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  DiscoverTab: NavigatorScreenParams<DiscoverStackParamList>;
  MatchesTab: NavigatorScreenParams<MatchesStackParamList>;
  ChatTab: NavigatorScreenParams<ChatStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack Types
export type HomeStackParamList = {
  Home: undefined;
  UserProfile: { userId: string };
  Settings: undefined;
  NotificationCenter: undefined;
};

// Discover Stack Types
export type DiscoverStackParamList = {
  Discover: undefined;
  UserDetail: { userId: string };
  Filters: undefined;
};

// Matches Stack Types
export type MatchesStackParamList = {
  Matches: undefined;
  MatchDetail: { matchId: string };
};

// Chat Stack Types
export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { chatId: string; userName: string };
  ChatSettings: { chatId: string };
};

// Profile Stack Types
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ProfilePhotos: undefined;
  AccountSettings: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  QuietHoursSettings: undefined;
  AdvancedNotificationSettings: undefined;
  HelpSupport: undefined;
  About: undefined;
};

// Root Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modal: undefined;
  Loading: undefined;
};

// Navigation prop types for screens
export type AuthStackNavigationProp = any; // Will be typed properly with navigation
export type MainTabNavigationProp = any;
export type RootStackNavigationProp = any;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}