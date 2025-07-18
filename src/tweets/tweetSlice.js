import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/apiService';

const initialState = {
  tweets: [],
  userTweets: [],
  timeline: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  },
};

// Async thunks for tweet operations
export const fetchTweets = createAsyncThunk(
  'tweets/fetchTweets',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await apiService.getTweets(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTweet = createAsyncThunk(
  'tweets/createTweet',
  async (tweetData, { rejectWithValue }) => {
    try {
      const response = await apiService.createTweet(tweetData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserTweets = createAsyncThunk(
  'tweets/fetchUserTweets',
  async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserTweets(userId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTimeline = createAsyncThunk(
  'tweets/fetchTimeline',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await apiService.getHomeTimeline(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const tweetSlice = createSlice({
  name: 'tweets',
  initialState,
  reducers: {
    addTweet: (state, action) => {
      state.tweets.unshift(action.payload);
      state.timeline.unshift(action.payload);
    },
    clearTweets: (state) => {
      state.tweets = [];
      state.userTweets = [];
      state.timeline = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        hasMore: true,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tweets
      .addCase(fetchTweets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTweets.fulfilled, (state, action) => {
        state.isLoading = false;
        const { tweets, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.tweets = tweets;
        } else {
          state.tweets = [...state.tweets, ...tweets];
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchTweets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create tweet
      .addCase(createTweet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTweet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tweets.unshift(action.payload);
        state.timeline.unshift(action.payload);
      })
      .addCase(createTweet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user tweets
      .addCase(fetchUserTweets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTweets.fulfilled, (state, action) => {
        state.isLoading = false;
        const { tweets, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.userTweets = tweets;
        } else {
          state.userTweets = [...state.userTweets, ...tweets];
        }
      })
      .addCase(fetchUserTweets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch timeline
      .addCase(fetchTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        const { tweets, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.timeline = tweets;
        } else {
          state.timeline = [...state.timeline, ...tweets];
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { addTweet, clearTweets, clearError } = tweetSlice.actions;

export default tweetSlice.reducer;
