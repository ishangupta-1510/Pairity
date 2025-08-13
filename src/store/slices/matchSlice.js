import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import matchService from '../../services/matchService';

const initialState = {
  dailyQueue: [],
  currentProfile: null,
  currentProfileIndex: 0,
  matches: [],
  likes: [],
  likesReceived: [],
  superLikesRemaining: 3,
  isLoading: false,
  error: null,
  queueExhausted: false,
  lastRefresh: null,
};

// Async thunks
export const fetchDailyQueue = createAsyncThunk(
  'match/fetchDailyQueue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await matchService.getDailyQueue();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch queue');
    }
  }
);

export const swipeProfile = createAsyncThunk(
  'match/swipe',
  async ({ targetUserId, action }, { rejectWithValue }) => {
    try {
      const response = await matchService.swipe(targetUserId, action);
      return { ...response, targetUserId, action };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Swipe failed');
    }
  }
);

export const fetchMatches = createAsyncThunk(
  'match/fetchMatches',
  async ({ status = 'active' }, { rejectWithValue }) => {
    try {
      const response = await matchService.getMatches(status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

export const fetchLikesReceived = createAsyncThunk(
  'match/fetchLikesReceived',
  async (_, { rejectWithValue }) => {
    try {
      const response = await matchService.getLikesReceived();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch likes');
    }
  }
);

export const unmatch = createAsyncThunk(
  'match/unmatch',
  async ({ matchId, reason }, { rejectWithValue }) => {
    try {
      await matchService.unmatch(matchId, reason);
      return matchId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Unmatch failed');
    }
  }
);

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload;
    },
    nextProfile: (state) => {
      if (state.currentProfileIndex < state.dailyQueue.length - 1) {
        state.currentProfileIndex++;
        state.currentProfile = state.dailyQueue[state.currentProfileIndex];
      } else {
        state.queueExhausted = true;
        state.currentProfile = null;
      }
    },
    resetQueue: (state) => {
      state.currentProfileIndex = 0;
      state.currentProfile = state.dailyQueue[0] || null;
      state.queueExhausted = false;
    },
    decrementSuperLikes: (state) => {
      if (state.superLikesRemaining > 0) {
        state.superLikesRemaining--;
      }
    },
    resetSuperLikes: (state) => {
      state.superLikesRemaining = 3;
    },
    addMatch: (state, action) => {
      state.matches.unshift(action.payload);
    },
    removeMatch: (state, action) => {
      state.matches = state.matches.filter(match => match.id !== action.payload);
    },
    clearMatchData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Daily Queue
    builder
      .addCase(fetchDailyQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyQueue = action.payload.profiles;
        state.currentProfile = action.payload.profiles[0] || null;
        state.currentProfileIndex = 0;
        state.queueExhausted = action.payload.profiles.length === 0;
        state.lastRefresh = new Date().toISOString();
      })
      .addCase(fetchDailyQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Swipe Profile
    builder
      .addCase(swipeProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(swipeProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Handle match creation
        if (action.payload.isMatch) {
          state.matches.unshift(action.payload.match);
        }
        
        // Handle super like decrement
        if (action.payload.action === 'superlike') {
          state.superLikesRemaining = Math.max(0, state.superLikesRemaining - 1);
        }
        
        // Move to next profile
        if (state.currentProfileIndex < state.dailyQueue.length - 1) {
          state.currentProfileIndex++;
          state.currentProfile = state.dailyQueue[state.currentProfileIndex];
        } else {
          state.queueExhausted = true;
          state.currentProfile = null;
        }
      })
      .addCase(swipeProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Matches
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matches = action.payload.matches;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Likes Received
    builder
      .addCase(fetchLikesReceived.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLikesReceived.fulfilled, (state, action) => {
        state.isLoading = false;
        state.likesReceived = action.payload.likes;
      })
      .addCase(fetchLikesReceived.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Unmatch
    builder
      .addCase(unmatch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unmatch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matches = state.matches.filter(match => match.id !== action.payload);
      })
      .addCase(unmatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setCurrentProfile,
  nextProfile,
  resetQueue,
  decrementSuperLikes,
  resetSuperLikes,
  addMatch,
  removeMatch,
  clearMatchData,
} = matchSlice.actions;

// Selectors
export const selectDailyQueue = (state) => state.match.dailyQueue;
export const selectCurrentProfile = (state) => state.match.currentProfile;
export const selectMatches = (state) => state.match.matches;
export const selectLikesReceived = (state) => state.match.likesReceived;
export const selectSuperLikesRemaining = (state) => state.match.superLikesRemaining;
export const selectQueueExhausted = (state) => state.match.queueExhausted;

export default matchSlice.reducer;