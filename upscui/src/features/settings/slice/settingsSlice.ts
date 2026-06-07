import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SettingsState } from '../../../types';

const initialState: SettingsState = { theme: 'light', notifications: true };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleNotifications(state) {
      state.notifications = !state.notifications;
    },
  },
});

export const { toggleTheme, toggleNotifications } = settingsSlice.actions;
export default settingsSlice.reducer;
