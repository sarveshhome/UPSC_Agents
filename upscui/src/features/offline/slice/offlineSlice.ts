import { createSlice } from '@reduxjs/toolkit';

interface OfflineState {
  questions: any[];
  lastSynced: string | null;
}

const initialState: OfflineState = { questions: [], lastSynced: null };

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOfflineQuestions(state, action) {
      state.questions = action.payload.questions;
      state.lastSynced = action.payload.syncedAt;
    },
  },
});

export const { setOfflineQuestions } = offlineSlice.actions;
export default offlineSlice.reducer;
