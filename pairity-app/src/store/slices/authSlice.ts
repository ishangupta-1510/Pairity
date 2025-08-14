import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  isPremium: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (
    credentials: { email: string; password: string; rememberMe?: boolean },
    { rejectWithValue }
  ) => {
    try {
      // Mock login for development
      // Accept any email/password combination for testing
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        firstName: credentials.email.split('@')[0],
        lastName: 'User',
        isVerified: true,
        isPremium: false,
        avatar: undefined,
      };

      const mockData = {
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('authToken', mockData.token);
      await AsyncStorage.setItem('refreshToken', mockData.refreshToken);
      
      if (credentials.rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return mockData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Call logout API if needed
      
      // Clear tokens from AsyncStorage
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'rememberMe']);
      
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!token) {
        return null;
      }

      // TODO: Validate token with API and get user data
      // For now, return mock data
      return {
        token,
        refreshToken,
        user: {
          id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: true,
          isPremium: false,
        },
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load stored auth');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser, setToken } = authSlice.actions;
export default authSlice.reducer;