import { createSlice } from '@reduxjs/toolkit';
import type { AnalyticsSummary } from '../../../types';

interface AnalyticsState {
  summary: AnalyticsSummary | null;
}

const initialState: AnalyticsState = { summary: null };

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSummary(state, action) { state.summary = action.payload; },
  },
});

export const { setSummary } = analyticsSlice.actions;
export default analyticsSlice.reducer;
