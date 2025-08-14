import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setTheme } from '@/store/slices/themeSlice';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
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
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E1E5E9',
    error: '#FF6B6B',
    success: '#51CF66',
    warning: '#FFD43B',
    info: '#339AF0',
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

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#404040',
  },
};

const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const systemColorScheme = useColorScheme();
  const { mode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (mode === 'system') {
      const currentTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
      dispatch(setTheme(currentTheme));
    }
  }, [systemColorScheme, mode, dispatch]);

  const currentTheme = mode === 'dark' ? darkTheme : lightTheme;

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