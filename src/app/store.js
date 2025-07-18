import { configureStore } from '@reduxjs/toolkit';
import tweetReducer from '../tweets/tweetSlice';
import authReducer from '../auth/authSlice';

export const store = configureStore({
  reducer: {
    tweets: tweetReducer,
    auth: authReducer,
  },
});