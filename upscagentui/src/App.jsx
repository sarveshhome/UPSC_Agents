import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuizPage from "./features/quiz/pages/QuizPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/quiz" element={<QuizPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
