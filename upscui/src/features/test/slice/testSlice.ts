import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TestSession } from '../../../types';

interface TestState { session: TestSession | null }
const initialState: TestState = { session: null };

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<Omit<TestSession, 'currentIndex' | 'started' | 'submitted' | 'timeLeft'>>) {
      state.session = {
        ...action.payload,
        currentIndex: 0,
        started: true,
        submitted: false,
        timeLeft: action.payload.timeLimit,
        startedAt: new Date().toISOString(),
      };
    },
    setAnswer(state, action: PayloadAction<{ index: number; answer: string }>) {
      if (!state.session) return;
      state.session.questions[action.payload.index].userAnswer = action.payload.answer;
    },
    nextQuestion(state) {
      if (!state.session) return;
      state.session.currentIndex = Math.min(state.session.currentIndex + 1, state.session.questions.length - 1);
    },
    prevQuestion(state) {
      if (!state.session) return;
      state.session.currentIndex = Math.max(state.session.currentIndex - 1, 0);
    },
    goToQuestion(state, action: PayloadAction<number>) {
      if (state.session) state.session.currentIndex = action.payload;
    },
    tick(state) {
      if (!state.session || state.session.submitted) return;
      state.session.timeLeft = Math.max(state.session.timeLeft - 1, 0);
    },
    submitSession(state) {
      if (state.session) state.session.submitted = true;
    },
    clearSession(state) { state.session = null; },
  },
});

export const { startSession, setAnswer, nextQuestion, prevQuestion, goToQuestion, tick, submitSession, clearSession } = testSlice.actions;
export default testSlice.reducer;
