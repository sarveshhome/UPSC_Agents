import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Bookmark } from '../../../types';

interface BookmarkState { items: Bookmark[] }
const initialState: BookmarkState = { items: [] };

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {
    addBookmark(state, action: PayloadAction<Bookmark>) {
      if (!state.items.find(b => b.questionId === action.payload.questionId))
        state.items.unshift(action.payload);
    },
    removeBookmark(state, action: PayloadAction<string>) {
      state.items = state.items.filter(b => b.questionId !== action.payload);
    },
    updateBookmarkNote(state, action: PayloadAction<{ questionId: string; note: string }>) {
      const b = state.items.find(b => b.questionId === action.payload.questionId);
      if (b) b.note = action.payload.note;
    },
  },
});

export const { addBookmark, removeBookmark, updateBookmarkNote } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
