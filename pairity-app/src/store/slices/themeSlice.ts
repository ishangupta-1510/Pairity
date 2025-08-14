import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

const initialState: ThemeState = {
  mode: 'system',
  isDark: false,
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
        state.mode = 'light';
        state.isDark = false;
      } else if (state.mode === 'light') {
        state.mode = 'dark';
        state.isDark = true;
      } else {
        state.mode = 'light';
        state.isDark = false;
      }
    },
  },
});

export const { setTheme, setIsDark, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;