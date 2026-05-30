import { configureStore } from "@reduxjs/toolkit";
import quizReducer from "../features/quiz/model/quizSlice";
import authReducer from "../features/auth/model/authSlice";

const store = configureStore({
  reducer: {
    quiz: quizReducer,
    auth: authReducer,
  },
});

export default store;
