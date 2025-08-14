import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

const initialState: ThemeState = {
  mode: 'system',  // Use system theme preference by default
  isDark: false,  // Will be updated based on system preference
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (action.payload !== 'system') {
        state.isDark = action.payload === 'dark';
      }
    },
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
    },
    toggleTheme: (state) => {
      if (state.mode === 'system') {
        // If currently on system mode, switch to manual mode opposite of current system preference
        state.mode = state.isDark ? 'light' : 'dark';
        state.isDark = !state.isDark;
      } else if (state.mode === 'light') {
        state.mode = 'dark';
        state.isDark = true;
      } else {
        // If dark mode, cycle through: dark -> light -> system
        state.mode = 'system';
        // isDark will be set by ThemeProvider based on system
      }
    },
  },
});

export const { setTheme, setIsDark, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;