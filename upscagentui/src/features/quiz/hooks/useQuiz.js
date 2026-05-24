import { useDispatch, useSelector } from "react-redux";
import { fetchNextQuestion, submitAnswer, toggleOption } from "../model/quizSlice";

const useQuiz = () => {
  const dispatch = useDispatch();
  const { question, result, selected, loading, error } = useSelector((state) => state.quiz);

  const loadNext = () => dispatch(fetchNextQuestion());
  const onToggle = (opt) => dispatch(toggleOption(opt));
  const onSubmit = () => dispatch(submitAnswer(selected.join(",")));

  return { question, result, selected, loading, error, loadNext, onToggle, onSubmit };
};

export default useQuiz;
