import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import notificationReducer from './slices/notificationSlice';
import videoCallReducer from './slices/videoCallSlice';
import premiumReducer from './slices/premiumSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'theme', 'notifications', 'videoCall', 'premium'], // Persist premium state
  blacklist: ['user'], // Don't persist user data (fetch fresh each time)
};

// Auth persist config (more specific)
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['token', 'refreshToken', 'isAuthenticated', 'user'],
};

// Theme persist config
const themePersistConfig = {
  key: 'theme',
  storage: AsyncStorage,
};

// Notification persist config
const notificationPersistConfig = {
  key: 'notifications',
  storage: AsyncStorage,
  whitelist: ['preferences', 'permissionGranted', 'fcmToken'],
  blacklist: ['activeBanners', 'loading'], // Don't persist temporary state
};

// Video call persist config
const videoCallPersistConfig = {
  key: 'videoCall',
  storage: AsyncStorage,
  whitelist: ['settings', 'permissions', 'premiumFeatures', 'callHistory', 'scheduledCalls'],
  blacklist: ['isInCall', 'localStream', 'remoteStream', 'participants', 'callMessages', 'callEmojis', 'incomingCall'], // Don't persist active call state
};

// Premium persist config
const premiumPersistConfig = {
  key: 'premium',
  storage: AsyncStorage,
  whitelist: ['subscription', 'features', 'boosts', 'superLikes', 'receipts', 'savedFilterPresets', 'paymentMethods', 'travelLocations'],
  blacklist: ['isLoading', 'error', 'purchaseFlow', 'activeBoostSession'], // Don't persist temporary state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer, // Not persisted
  theme: persistReducer(themePersistConfig, themeReducer),
  notifications: persistReducer(notificationPersistConfig, notificationReducer),
  videoCall: persistReducer(videoCallPersistConfig, videoCallReducer),
  premium: persistReducer(premiumPersistConfig, premiumReducer),
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => store.dispatch;
export const useAppSelector = (selector: (state: RootState) => any) => 
  useSelector(selector as any);

export default store;