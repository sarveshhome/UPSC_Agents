import { createSlice } from '@reduxjs/toolkit';
import type { NotificationPrefs } from '../../../types';

interface NotificationsState {
  prefs: NotificationPrefs;
}

const initialState: NotificationsState = {
  prefs: {
    studyReminder: true,
    studyReminderTime: '08:00',
    testReminder: true,
    testReminderTime: '18:00',
    currentAffairs: true,
  },
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    updatePrefs(state, action) { state.prefs = { ...state.prefs, ...action.payload }; },
  },
});

export const { updatePrefs } = notificationsSlice.actions;
export default notificationsSlice.reducer;
