import { createSlice } from '@reduxjs/toolkit';

interface AdminState {
  questions: any[];
  stats: any | null;
  analytics: any | null;
}

const initialState: AdminState = { questions: [], stats: null, analytics: null };

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setQuestions(state, action) { state.questions = action.payload; },
    setStats(state, action) { state.stats = action.payload; },
    setAnalytics(state, action) { state.analytics = action.payload; },
  },
});

export const { setQuestions, setStats, setAnalytics } = adminSlice.actions;
export default adminSlice.reducer;
