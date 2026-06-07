import { createSlice } from '@reduxjs/toolkit';
import { upscApi } from '../../../store/api';
import type { CommunityPost } from '../../../types';

interface CommunityState {
  feed: CommunityPost[];
  page: number;
}

const communitySlice = createSlice({
  name: 'community',
  initialState: { feed: [] as CommunityPost[], page: 0 },
  reducers: {
    nextPage: state => { state.page += 1; },
    resetFeed: state => { state.feed = []; state.page = 0; },
  },
  extraReducers: builder => {
    builder.addMatcher(upscApi.endpoints.getCommunityFeed.matchFulfilled, (state, { payload }) => {
      if (state.page === 0) state.feed = payload;
      else state.feed = [...state.feed, ...payload];
    });
  },
});

export const { nextPage, resetFeed } = communitySlice.actions;
export default communitySlice.reducer;
