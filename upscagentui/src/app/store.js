import { configureStore } from "@reduxjs/toolkit";
import quizReducer from "../features/quiz/model/quizSlice";

const store = configureStore({
  reducer: {
    quiz: quizReducer,
  },
});

export default store;
