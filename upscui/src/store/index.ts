import { configureStore } from '@reduxjs/toolkit';
import { upscApi } from './api';
import authReducer          from '../features/auth/slice/authSlice';
import homeReducer          from '../features/home/slice/homeSlice';
import settingsReducer      from '../features/settings/slice/settingsSlice';
import testReducer          from '../features/test/slice/testSlice';
import bookmarkReducer      from '../features/bookmark/slice/bookmarkSlice';
import notesReducer         from '../features/notes/slice/notesSlice';
import searchReducer        from '../features/search/slice/searchSlice';
import gamificationReducer  from '../features/gamification/slice/gamificationSlice';
import leaderboardReducer   from '../features/leaderboard/slice/leaderboardSlice';
import communityReducer     from '../features/community/slice/communitySlice';

export const store = configureStore({
  reducer: {
    auth:           authReducer,
    home:           homeReducer,
    settings:       settingsReducer,
    test:           testReducer,
    bookmark:       bookmarkReducer,
    notes:          notesReducer,
    search:         searchReducer,
    gamification:   gamificationReducer,
    leaderboard:    leaderboardReducer,
    community:      communityReducer,
    [upscApi.reducerPath]: upscApi.reducer,
  },
  middleware: getDefault => getDefault().concat(upscApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
