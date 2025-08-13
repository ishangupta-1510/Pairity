import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  profile: null,
  preferences: {
    ageRange: { min: 18, max: 35 },
    distance: 50,
    gender: null,
    relationshipGoal: null,
  },
  photos: [],
  verificationStatus: {
    email: false,
    phone: false,
    photo: false,
    id: false,
  },
  profileCompletionScore: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadPhoto = createAsyncThunk(
  'user/uploadPhoto',
  async (photoData, { rejectWithValue }) => {
    try {
      const response = await userService.uploadPhoto(photoData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload photo');
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'user/deletePhoto',
  async (photoId, { rejectWithValue }) => {
    try {
      await userService.deletePhoto(photoId);
      return photoId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete photo');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userService.updatePreferences(preferences);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setVerificationStatus: (state, action) => {
      state.verificationStatus = { ...state.verificationStatus, ...action.payload };
    },
    setProfileCompletionScore: (state, action) => {
      state.profileCompletionScore = action.payload;
    },
    clearUserData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
        state.preferences = action.payload.preferences;
        state.photos = action.payload.photos;
        state.verificationStatus = action.payload.verificationStatus;
        state.profileCompletionScore = action.payload.completionScore;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = { ...state.profile, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Upload Photo
    builder
      .addCase(uploadPhoto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        state.isLoading = false;
        state.photos.push(action.payload);
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Photo
    builder
      .addCase(deletePhoto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.isLoading = false;
        state.photos = state.photos.filter(photo => photo.id !== action.payload);
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Preferences
    builder
      .addCase(updatePreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setProfile,
  setPreferences,
  setVerificationStatus,
  setProfileCompletionScore,
  clearUserData,
} = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserPhotos = (state) => state.user.photos;
export const selectVerificationStatus = (state) => state.user.verificationStatus;
export const selectProfileCompletionScore = (state) => state.user.profileCompletionScore;

export default userSlice.reducer;