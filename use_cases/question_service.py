import uuid
import logging
from typing import List, Optional

from entities.question import Question, QuestionOption
from use_cases.repositories import QuestionRepository, UserHistoryRepository
from llm import ask_llm

logger = logging.getLogger(__name__)


class QuestionService:
    def __init__(self, question_repo: QuestionRepository,
                 history_repo: UserHistoryRepository):
        self.question_repo = question_repo
        self.history_repo = history_repo

    def get_questions(self, user_id: int, subject: str = "",
                      topic: str = "", difficulty: str = "medium",
                      count: int = 10) -> List[Question]:
        # 1. Try DB first
        questions = self.question_repo.get_unattempted(
            user_id, subject, topic, difficulty, count
        )
        if len(questions) >= count:
            return questions

        # 2. Generate missing count via LLM
        needed = count - len(questions)
        generated = self._generate_from_llm(subject, topic, difficulty, needed)

        # 3. Persist generated questions for future users
        if generated:
            self.question_repo.bulk_save(generated)
            # Log generation
            if hasattr(self.question_repo, 'log_generation'):
                prompt_summary = f"subject={subject} topic={topic} difficulty={difficulty} count={needed}"
                self.question_repo.log_generation(prompt_summary, subject, topic, difficulty, len(generated))

        return questions + generated

    def get_single_question(self, user_id: int) -> Question:
        qs = self.get_questions(user_id, count=1)
        if qs:
            return qs[0]
        raise ValueError("Could not fetch a question")

    def _generate_from_llm(self, subject: str, topic: str,
                            difficulty: str, count: int) -> List[Question]:
        effective_subject = subject or "General Science"
        prompt = (
            f"Generate {count} unique UPSC MCQ questions"
            + (f" on subject '{effective_subject}'" if effective_subject else "")
            + (f" topic '{topic}'" if topic else "")
            + (f" difficulty '{difficulty}'" if difficulty else "")
            + ". Return a JSON array with each item having: "
              "Ques, Option1, Option2, Option3, Option4, Option5, Ans, "
              "explanation, subject, topic, difficulty. "
              "Ans should be like 'Option2' or 'Option1,Option3'."
        )
        try:
            raw = ask_llm(prompt)
            items = raw if isinstance(raw, list) else raw.get("questions", [raw])
            return [self._parse_llm_item(item, effective_subject) for item in items if item.get("Ques")]
        except Exception:
            logger.error("LLM generation failed, returning empty list")
            return []

    def _parse_llm_item(self, item: dict, fallback_subject: str = "") -> Question:
        ans = item.get("Ans", "Option1")
        correct_keys = {k.strip() for k in ans.split(",")}
        options = [
            QuestionOption(
                option_key=f"Option{i}",
                option_text=item.get(f"Option{i}", ""),
                is_correct=f"Option{i}" in correct_keys,
            )
            for i in range(1, 6)
        ]
        return Question(
            id=str(uuid.uuid4()),
            subject=item.get("subject", fallback_subject or "General Science"),
            topic=item.get("topic", ""),
            difficulty=item.get("difficulty", "medium"),
            question_text=item.get("Ques", ""),
            explanation=item.get("explanation", ""),
            source="cohere",
            correct_answer=ans,
            options=options,
        )

    def question_to_api_dict(self, q: Question) -> dict:
        d = {"id": q.id, "Ques": q.question_text, "subject": q.subject,
             "topic": q.topic, "difficulty": q.difficulty,
             "explanation": q.explanation, "Ans": q.correct_answer}
        for opt in q.options:
            d[opt.option_key] = opt.option_text
        return d
