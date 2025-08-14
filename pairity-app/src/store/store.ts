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

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'theme'], // Only persist auth and theme
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

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer, // Not persisted
  theme: persistReducer(themePersistConfig, themeReducer),
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