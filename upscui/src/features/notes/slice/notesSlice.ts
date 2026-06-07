import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Note } from '../../../types';

interface NotesState { items: Note[] }
const initialState: NotesState = { items: [] };

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<Note>) {
      state.items.unshift(action.payload);
    },
    updateNote(state, action: PayloadAction<Partial<Note> & { id: string }>) {
      const n = state.items.find(n => n.id === action.payload.id);
      if (n) Object.assign(n, { ...action.payload, updatedAt: new Date().toISOString() });
    },
    deleteNote(state, action: PayloadAction<string>) {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
  },
});

export const { addNote, updateNote, deleteNote } = notesSlice.actions;
export default notesSlice.reducer;
