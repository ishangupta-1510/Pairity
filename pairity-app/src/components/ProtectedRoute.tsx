import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'user' | 'premium' | 'admin';
  fallbackScreen?: string;
  preserveRoute?: boolean;
}

interface UserRole {
  type: 'user' | 'premium' | 'admin';
  permissions: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole = 'user',
  fallbackScreen = 'Login',
  preserveRoute = true,
}) => {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading, token, user } = useSelector((state: RootState) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Check user role and permissions
  const checkUserAccess = (userRole: UserRole, requiredRole: string): boolean => {
    const roleHierarchy = {
      user: 0,
      premium: 1,
      admin: 2,
    };

    const userLevel = roleHierarchy[userRole.type] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  };

  // Check token expiration
  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      try {
        // If route doesn't require auth, allow access
        if (!requireAuth) {
          setHasAccess(true);
          setIsChecking(false);
          return;
        }

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setHasAccess(false);
          setIsChecking(false);
          
          if (preserveRoute) {
            // Store current route to redirect after login
            const currentRoute = navigation.getState();
            // TODO: Store route in AsyncStorage or Redux
          }
          
          navigation.navigate(fallbackScreen as never);
          return;
        }

        // Check token expiration
        if (isTokenExpired(token)) {
          setHasAccess(false);
          setIsChecking(false);
          
          // TODO: Attempt token refresh
          // If refresh fails, redirect to login
          navigation.navigate('Login' as never);
          return;
        }

        // Check role-based access
        const userRole: UserRole = {
          type: user.isPremium ? 'premium' : 'user',
          permissions: user.permissions || [],
        };

        if (!checkUserAccess(userRole, requiredRole)) {
          setHasAccess(false);
          setIsChecking(false);
          
          // Show upgrade prompt for premium features
          if (requiredRole === 'premium' && userRole.type === 'user') {
            navigation.navigate('PremiumUpgrade' as never);
          } else {
            navigation.navigate('Unauthorized' as never);
          }
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Access check error:', error);
        setHasAccess(false);
        navigation.navigate(fallbackScreen as never);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, user, token, requireAuth, requiredRole, navigation, fallbackScreen, preserveRoute]);

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return <Loading text="Checking access..." />;
  }

  // Show content if user has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute;