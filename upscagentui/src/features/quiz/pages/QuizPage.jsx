import { useEffect } from "react";
import useQuiz from "../hooks/useQuiz";
import QuizCard from "../components/QuizCard";
import Loader from "../../../shared/components/Loader";
import ErrorMessage from "../../../shared/components/ErrorMessage";
import "./QuizPage.css";

const QuizPage = () => {
  const { question, result, selected, loading, error, loadNext, onToggle, onSubmit } = useQuiz();

  useEffect(() => { loadNext(); }, []);

  return (
    <div className="quiz-page">
      <h1 className="quiz-title">🧪 UPSC Science MCQ</h1>
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
