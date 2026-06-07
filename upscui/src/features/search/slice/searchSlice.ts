import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SearchFilters } from '../../../types';

interface SearchState { filters: SearchFilters }
const initialState: SearchState = { filters: { query: '' } };

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) { state.filters = { query: '' }; },
  },
});

export const { setFilters, clearFilters } = searchSlice.actions;
export default searchSlice.reducer;
