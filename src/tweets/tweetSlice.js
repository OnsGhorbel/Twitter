import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tweets: [],
};

export const tweetSlice = createSlice({
  name: 'tweets',
  initialState,
  reducers: {
    addTweet: (state, action) => {
      state.tweets.unshift(action.payload); // add to top
    },
  },
});

export const { addTweet } = tweetSlice.actions;
export default tweetSlice.reducer;
