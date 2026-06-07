import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Tab = 'global' | 'weekly' | 'state';

interface LeaderboardState {
  activeTab: Tab;
  selectedState: string;
}

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: { activeTab: 'global' as Tab, selectedState: 'Maharashtra' },
  reducers: {
    setTab: (state, action: PayloadAction<Tab>) => { state.activeTab = action.payload; },
    setState: (state, action: PayloadAction<string>) => { state.selectedState = action.payload; },
  },
});

export const { setTab, setState } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
