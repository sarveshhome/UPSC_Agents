import { configureStore } from '@reduxjs/toolkit';
import { upscApi } from './api';
import authReducer from '../features/auth/slice/authSlice';
import homeReducer from '../features/home/slice/homeSlice';
import settingsReducer from '../features/settings/slice/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    settings: settingsReducer,
    [upscApi.reducerPath]: upscApi.reducer,
  },
  middleware: getDefault =>
    getDefault().concat(upscApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
