import { createSlice } from '@reduxjs/toolkit';

interface RevisionState {
  due: any[];
  upcoming: any[];
}

const initialState: RevisionState = { due: [], upcoming: [] };

const revisionSlice = createSlice({
  name: 'revision',
  initialState,
  reducers: {
    setSchedule(state, action) {
      state.due = action.payload.due;
      state.upcoming = action.payload.upcoming;
    },
  },
});

export const { setSchedule } = revisionSlice.actions;
export default revisionSlice.reducer;
