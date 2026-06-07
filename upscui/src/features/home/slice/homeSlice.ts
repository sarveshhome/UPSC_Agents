import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Question } from '../../../types';

interface HomeState {
  currentQuestion: Question | null;
  selectedOptions: string[];
}

const initialState: HomeState = { currentQuestion: null, selectedOptions: [] };

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setCurrentQuestion(state, action: PayloadAction<Question>) {
      state.currentQuestion = action.payload;
      state.selectedOptions = [];
    },
    toggleOption(state, action: PayloadAction<string>) {
      const opt = action.payload;
      const idx = state.selectedOptions.indexOf(opt);
      if (idx >= 0) state.selectedOptions.splice(idx, 1);
      else state.selectedOptions.push(opt);
    },
    clearSelection(state) {
      state.selectedOptions = [];
    },
  },
});

export const { setCurrentQuestion, toggleOption, clearSelection } = homeSlice.actions;
export default homeSlice.reducer;
