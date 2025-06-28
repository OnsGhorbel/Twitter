import { configureStore } from '@reduxjs/toolkit';
import tweetReducer from '../tweets/tweetSlice';

export const store = configureStore({
  reducer: {
    tweets: tweetReducer,
  },
});