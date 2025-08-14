import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  interestedIn?: 'male' | 'female' | 'everyone';
  bio?: string;
  job?: string;
  company?: string;
  education?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  photos: string[];
  interests: string[];
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    maxDistance: number;
    showMeOnDiscovery: boolean;
    verifiedOnly: boolean;
  };
  settings: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    profileVisibility: boolean;
    showOnlineStatus: boolean;
    showDistance: boolean;
  };
  subscription: {
    isPremium: boolean;
    plan?: 'basic' | 'premium' | 'gold';
    expiresAt?: string;
  };
  verification: {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isProfileVerified: boolean;
  };
  stats: {
    profileViews: number;
    likes: number;
    matches: number;
    joinedAt: string;
    lastActive: string;
  };
}

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateLoading: boolean;
}

// Initial state
const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  updateLoading: false,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (updates: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

export const uploadProfilePhoto = createAsyncThunk(
  'user/uploadProfilePhoto',
  async (photoData: { uri: string; type: string; name: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: photoData.uri,
        type: photoData.type,
        name: photoData.name,
      } as any);

      // TODO: Replace with actual API call
      const response = await fetch('/api/users/photos', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();
      return data.photoUrl;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload photo');
    }
  }
);

export const deleteProfilePhoto = createAsyncThunk(
  'user/deleteProfilePhoto',
  async (photoUrl: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/users/photos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      return photoUrl;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete photo');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    addPhoto: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.photos.push(action.payload);
      }
    },
    removePhoto: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.photos = state.profile.photos.filter(
          photo => photo !== action.payload
        );
      }
    },
    reorderPhotos: (state, action: PayloadAction<string[]>) => {
      if (state.profile) {
        state.profile.photos = action.payload;
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserProfile['preferences']>>) => {
      if (state.profile) {
        state.profile.preferences = { ...state.profile.preferences, ...action.payload };
      }
    },
    updateSettings: (state, action: PayloadAction<Partial<UserProfile['settings']>>) => {
      if (state.profile) {
        state.profile.settings = { ...state.profile.settings, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // Upload profile photo
    builder
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.photos.push(action.payload);
        }
      });

    // Delete profile photo
    builder
      .addCase(deleteProfilePhoto.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.photos = state.profile.photos.filter(
            photo => photo !== action.payload
          );
        }
      });
  },
});

export const {
  clearError,
  updateLocalProfile,
  addPhoto,
  removePhoto,
  reorderPhotos,
  updatePreferences,
  updateSettings,
} = userSlice.actions;

export default userSlice.reducer;