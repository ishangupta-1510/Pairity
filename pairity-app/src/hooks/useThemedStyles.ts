import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '@/components/ThemeProvider';
import { Theme } from '@/components/ThemeProvider';
import { RootState } from '@/store/store';

/**
 * Custom hook for creating themed styles
 * @param styles - Function that takes theme and returns styles
 * @returns Memoized styles object
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styles: (theme: Theme) => T
): T {
  const theme = useTheme();
  
  return useMemo(() => styles(theme), [theme, styles]);
}

/**
 * Helper function to create themed styles with proper typing
 */
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: Theme) => T
) {
  return stylesFn;
}

/**
 * Hook to get theme mode and system theme information
 */
export function useThemeInfo() {
  const theme = useTheme();
  const systemColorScheme = useColorScheme();
  const { mode, isDark } = useSelector((state: RootState) => state.theme);
  
  return {
    theme,
    mode,
    isDark,
    isSystemTheme: mode === 'system',
    systemIsDark: systemColorScheme === 'dark',
    systemColorScheme,
  };
}