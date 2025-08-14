import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setTheme, setIsDark } from '@/store/slices/themeSlice';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceLight: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderLight: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    gradientStart: string;
    gradientEnd: string;
    overlay: string;
    shadow: string;
    highlight: string;
    premium: string;
    premiumGold: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#9B59B6',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceLight: '#FAFBFC',
    card: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    textTertiary: '#95A5A6',
    border: '#E1E8ED',
    borderLight: '#F1F4F7',
    error: '#E74C3C',
    success: '#27AE60',
    warning: '#F39C12',
    info: '#3498DB',
    gradientStart: '#FF6B6B',
    gradientEnd: '#4ECDC4',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: '#000000',
    highlight: '#FFE5E5',
    premium: '#FFD700',
    premiumGold: '#FFA500',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// Premium dark theme with sophisticated colors
const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#FF7979',  // Softer coral red for dark mode
    secondary: '#6DD5ED',  // Softer cyan
    accent: '#C06FE8',  // Soft purple accent
    background: '#0A0A0B',  // Rich black background
    surface: '#151517',  // Slightly lighter surface
    surfaceLight: '#1E1E21',  // Card backgrounds
    card: '#1A1A1D',  // Premium card background
    text: '#F5F5F7',  // Off-white for better readability
    textSecondary: '#B8B8C1',  // Muted gray text
    textTertiary: '#7A7A85',  // Even more muted
    border: '#2A2A2F',  // Subtle borders
    borderLight: '#35353B',  // Lighter borders
    error: '#FF6B6B',
    success: '#4ADE80',
    warning: '#FBBF24',
    info: '#60A5FA',
    gradientStart: '#FF6B9D',  // Premium gradient start
    gradientEnd: '#C06FE8',  // Premium gradient end
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: '#000000',
    highlight: 'rgba(255, 107, 157, 0.1)',  // Subtle highlight
    premium: '#FFD700',  // Gold for premium features
    premiumGold: '#FFC107',  // Alternative gold
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    },
  },
};

const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const systemColorScheme = useColorScheme();
  const { mode, isDark } = useSelector((state: RootState) => state.theme);

  // Initialize system theme on app start and when system changes
  useEffect(() => {
    if (mode === 'system') {
      const systemIsDark = systemColorScheme === 'dark';
      dispatch(setIsDark(systemIsDark));
    }
  }, [systemColorScheme, mode, dispatch]);

  // Determine which theme to use
  const currentTheme = (() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  })();

  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { lightTheme, darkTheme };