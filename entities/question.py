from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List


@dataclass
class QuestionOption:
    option_key: str       # Option1..Option5
    option_text: str
    is_correct: bool = False


@dataclass
class Question:
    id: Optional[str] = None
    subject: str = ""
    topic: str = ""
    difficulty: str = "medium"
    question_text: str = ""
    explanation: str = ""
    source: str = "cohere"
    options: List[QuestionOption] = field(default_factory=list)
    correct_answer: str = ""   # e.g. "Option2" or "Option1,Option3"
    created_at: Optional[datetime] = None


@dataclass
class UserQuestionHistory:
    id: Optional[str] = None
    user_id: int = 0
    question_id: str = ""
    selected_option: Optional[str] = None
    is_correct: Optional[bool] = None
    time_taken: int = 0
    is_bookmarked: bool = False
    attempted_at: Optional[datetime] = None
