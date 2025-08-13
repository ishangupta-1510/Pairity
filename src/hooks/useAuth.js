import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login,
  logout,
  register,
  refreshToken,
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  setUser,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Check if token exists on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        dispatch(setUser(JSON.parse(userData)));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }, [dispatch]);

  const signIn = useCallback(
    async (email, password) => {
      try {
        const result = await dispatch(login({ email, password })).unwrap();
        
        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message || 'Login failed' };
      }
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (userData) => {
      try {
        const result = await dispatch(register(userData)).unwrap();
        
        if (!result.requiresPayment) {
          // Female user - store user data
          await AsyncStorage.setItem('user', JSON.stringify(result.user));
        }
        
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message || 'Registration failed' };
      }
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      await AsyncStorage.multiRemove(['user', 'token', 'refreshToken']);
      return { success: true };
    } catch (error) {
      // Even if server logout fails, clear local data
      await AsyncStorage.multiRemove(['user', 'token', 'refreshToken']);
      return { success: true };
    }
  }, [dispatch]);

  const refreshUserToken = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    subscription: auth.subscription,
    signIn,
    signUp,
    signOut,
    refreshUserToken,
    checkAuthStatus,
  };
};