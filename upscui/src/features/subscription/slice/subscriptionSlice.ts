import { createSlice } from '@reduxjs/toolkit';

interface SubscriptionState {
  plans: any[];
  status: any | null;
}

const initialState: SubscriptionState = { plans: [], status: null };

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setPlans(state, action) { state.plans = action.payload; },
    setStatus(state, action) { state.status = action.payload; },
  },
});

export const { setPlans, setStatus } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
