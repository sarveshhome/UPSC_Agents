import { createSlice } from '@reduxjs/toolkit';
import { upscApi } from '../../../store/api';
import type { GamificationProfile, Badge, ActivityResult } from '../../../types';

interface GamificationState {
  profile: GamificationProfile | null;
  lastActivityResult: ActivityResult | null;
  newBadgeAlert: Badge | null;
}

const initialState: GamificationState = {
  profile: null,
  lastActivityResult: null,
  newBadgeAlert: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearBadgeAlert: state => { state.newBadgeAlert = null; },
  },
  extraReducers: builder => {
    builder
      .addMatcher(upscApi.endpoints.getGamificationProfile.matchFulfilled, (state, { payload }) => {
        state.profile = payload;
      })
      .addMatcher(upscApi.endpoints.recordActivity.matchFulfilled, (state, { payload }) => {
        state.lastActivityResult = payload;
        if (payload.new_badges.length > 0) {
          state.newBadgeAlert = payload.new_badges[0];
        }
        if (state.profile) {
          state.profile.total_xp     = payload.xp.total_xp;
          state.profile.level        = payload.xp.level;
          state.profile.current_streak = payload.streak.current;
          state.profile.longest_streak = payload.streak.longest;
        }
      });
  },
});

export const { clearBadgeAlert } = gamificationSlice.actions;
export default gamificationSlice.reducer;
