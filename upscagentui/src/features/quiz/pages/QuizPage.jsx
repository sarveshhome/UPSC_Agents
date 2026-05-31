import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useQuiz from "../hooks/useQuiz";
import QuizCard from "../components/QuizCard";
import Loader from "../../../shared/components/Loader";
import ErrorMessage from "../../../shared/components/ErrorMessage";
import { logoutUser } from "../../auth/model/authSlice";
import "./QuizPage.css";

const QuizPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { question, result, selected, loading, error, loadNext, onToggle, onSubmit } = useQuiz();

  useEffect(() => { loadNext(); }, []);

  const handleLogout = () => {
    dispatch(logoutUser(token));
    navigate("/login");
  };

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1 className="quiz-title">🧪 UPSC Science MCQ</h1>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
      {error && <ErrorMessage message={error} />}
      {loading && !question && <Loader />}
      {question && (
        <QuizCard
          question={question}
          selected={selected}
          result={result}
          onToggle={onToggle}
          onSubmit={onSubmit}
          onNext={loadNext}
          loading={loading}
        />
      )}
    </div>
  );
};

export default QuizPage;
