import { createSlice } from '@reduxjs/toolkit';
import type { CurrentAffairsArticle } from '../../../types';

interface CurrentAffairsState {
  dailyArticles: CurrentAffairsArticle[];
}

const initialState: CurrentAffairsState = { dailyArticles: [] };

const currentAffairsSlice = createSlice({
  name: 'currentAffairs',
  initialState,
  reducers: {
    setDailyArticles(state, action) { state.dailyArticles = action.payload; },
  },
});

export const { setDailyArticles } = currentAffairsSlice.actions;
export default currentAffairsSlice.reducer;
