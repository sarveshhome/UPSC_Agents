import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getNextQuestion, postAnswer } from "../api/quizApi";

export const fetchNextQuestion = createAsyncThunk("quiz/fetchNext", async (_, { rejectWithValue }) => {
  try {
    const res = await getNextQuestion();
    return res.data;
  } catch (err) {
    return rejectWithValue("Failed to load question. Is the server running?");
  }
});

export const submitAnswer = createAsyncThunk("quiz/submitAnswer", async (answer, { rejectWithValue }) => {
  try {
    const res = await postAnswer(answer);
    return res.data;
  } catch (err) {
    return rejectWithValue("Failed to submit answer.");
  }
});

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    question: null,
    result: null,
    selected: [],
    loading: false,
    error: null,
  },
  reducers: {
    toggleOption(state, action) {
      const opt = action.payload;
      if (state.selected.includes(opt)) {
        state.selected = state.selected.filter((o) => o !== opt);
      } else {
        state.selected.push(opt);
      }
    },
    clearResult(state) {
      state.result = null;
      state.selected = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNextQuestion.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNextQuestion.fulfilled, (state, action) => { state.loading = false; state.question = action.payload; state.result = null; state.selected = []; state.error = null; })
      .addCase(fetchNextQuestion.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(submitAnswer.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitAnswer.fulfilled, (state, action) => { state.loading = false; state.result = action.payload; })
      .addCase(submitAnswer.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { toggleOption, clearResult } = quizSlice.actions;
export default quizSlice.reducer;
