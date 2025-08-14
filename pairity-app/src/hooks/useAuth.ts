import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@/store/store';
import { logoutUser, setToken, loadStoredAuth } from '@/store/slices/authSlice';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: 'user' | 'premium' | 'admin') => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user, token, refreshToken: storedRefreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize auth state on app start
  useEffect(() => {
    dispatch(loadStoredAuth() as any);
  }, [dispatch]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const checkTokenExpiry = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;

        // Refresh token 5 minutes before expiry
        if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
          refreshToken();
        }
      } catch (error) {
        console.error('Token parsing error:', error);
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  const login = async (credentials: any) => {
    // Login logic is handled by the loginUser thunk in authSlice
    // This is just a wrapper for consistency
    throw new Error('Use dispatch(loginUser(credentials)) directly');
  };

  const logout = async (): Promise<void> => {
    try {
      await dispatch(logoutUser() as any);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if API call fails
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'rememberMe']);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!storedRefreshToken || isRefreshing) return false;

    setIsRefreshing(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: storedRefreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update token in store and storage
      dispatch(setToken(data.token));
      await AsyncStorage.setItem('authToken', data.token);
      
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: 'user' | 'premium' | 'admin'): boolean => {
    if (!user) return false;

    const userRole = user.isPremium ? 'premium' : 'user';
    const roleHierarchy = {
      user: 0,
      premium: 1,
      admin: 2,
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[role] || 0;

    return userLevel >= requiredLevel;
  };

  return {
    isAuthenticated,
    isLoading: isLoading || isRefreshing,
    user,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
  };
};