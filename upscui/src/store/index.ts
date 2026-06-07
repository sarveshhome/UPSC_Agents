import { configureStore } from '@reduxjs/toolkit';
import { upscApi } from './api';
import authReducer from '../features/auth/slice/authSlice';
import homeReducer from '../features/home/slice/homeSlice';
import settingsReducer from '../features/settings/slice/settingsSlice';
import testReducer from '../features/test/slice/testSlice';
import bookmarkReducer from '../features/bookmark/slice/bookmarkSlice';
import notesReducer from '../features/notes/slice/notesSlice';
import searchReducer from '../features/search/slice/searchSlice';
import analyticsReducer from '../features/analytics/slice/analyticsSlice';
import notificationsReducer from '../features/notifications/slice/notificationsSlice';
import currentAffairsReducer from '../features/currentAffairs/slice/currentAffairsSlice';
import aiReducer from '../features/ai/slice/aiSlice';
import revisionReducer from '../features/revision/slice/revisionSlice';
import subscriptionReducer from '../features/subscription/slice/subscriptionSlice';
import offlineReducer from '../features/offline/slice/offlineSlice';
import adminReducer from '../features/admin/slice/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    settings: settingsReducer,
    test: testReducer,
    bookmark: bookmarkReducer,
    notes: notesReducer,
    search: searchReducer,
    analytics: analyticsReducer,
    notifications: notificationsReducer,
    currentAffairs: currentAffairsReducer,
    ai: aiReducer,
    revision: revisionReducer,
    subscription: subscriptionReducer,
    offline: offlineReducer,
    admin: adminReducer,
    [upscApi.reducerPath]: upscApi.reducer,
  },
  middleware: getDefault =>
    getDefault().concat(upscApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
