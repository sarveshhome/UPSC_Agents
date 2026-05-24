import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuizPage from "./features/quiz/pages/QuizPage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<QuizPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
