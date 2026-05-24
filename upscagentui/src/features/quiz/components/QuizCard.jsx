import "./QuizCard.css";

const OPTIONS = ["Option1", "Option2", "Option3", "Option4", "Option5"];

const QuizCard = ({ question, selected, result, onToggle, onSubmit, onNext, loading }) => {
  const correctSet = new Set(question.Ans.split(","));

  const getOptionClass = (opt) => {
    if (!result) return selected.includes(opt) ? "option selected" : "option";
    if (correctSet.has(opt)) return "option correct";
    if (selected.includes(opt) && !correctSet.has(opt)) return "option wrong";
    return "option";
  };

  return (
    <div className="quiz-card">
      <p className="question">{question.Ques}</p>
      <div className="options">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            className={getOptionClass(opt)}
            onClick={() => !result && onToggle(opt)}
            disabled={!!result}
          >
            <span className="opt-label">{opt.replace("Option", "")}.</span> {question[opt]}
          </button>
        ))}
      </div>

      {result && (
        <div className={`result ${result.correct ? "result-correct" : "result-wrong"}`}>
          {result.correct ? "✅ Correct!" : `❌ Wrong! Correct: ${result.correct_answer}`}
        </div>
      )}

      <div className="actions">
        {!result ? (
          <button className="btn-submit" onClick={onSubmit} disabled={!selected.length || loading}>
            Submit Answer
          </button>
        ) : (
          <button className="btn-next" onClick={onNext} disabled={loading}>
            {loading ? "Loading..." : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
