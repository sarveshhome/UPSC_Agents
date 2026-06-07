import { createSlice } from '@reduxjs/toolkit';

interface AIState {
  recommendations: any | null;
  prediction: any | null;
}

const initialState: AIState = { recommendations: null, prediction: null };

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setRecommendations(state, action) { state.recommendations = action.payload; },
    setPrediction(state, action) { state.prediction = action.payload; },
  },
});

export const { setRecommendations, setPrediction } = aiSlice.actions;
export default aiSlice.reducer;
