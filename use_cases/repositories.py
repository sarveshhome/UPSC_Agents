from abc import ABC, abstractmethod
from entities.user import User, Session
from entities.question import Question, UserQuestionHistory
from typing import Optional, List


class UserRepository(ABC):
    @abstractmethod
    def find_by_username(self, username: str) -> Optional[User]:
        pass

    @abstractmethod
    def save(self, user: User) -> bool:
        pass


class SessionRepository(ABC):
    @abstractmethod
    def create(self, username: str) -> str:
        pass

    @abstractmethod
    def validate(self, token: str) -> bool:
        pass

    @abstractmethod
    def delete_expired(self) -> None:
        pass

    @abstractmethod
    def delete(self, token: str) -> None:
        pass


class QuestionRepository(ABC):
    @abstractmethod
    def get_unattempted(self, user_id: int, subject: str, topic: str,
                        difficulty: str, count: int) -> List[Question]:
        pass

    @abstractmethod
    def bulk_save(self, questions: List[Question]) -> None:
        pass

    @abstractmethod
    def get_by_id(self, question_id: str) -> Optional[Question]:
        pass

    @abstractmethod
    def log_generation(self, prompt: str, subject: str, topic: str,
                       difficulty: str, count: int) -> None:
        pass


class UserHistoryRepository(ABC):
    @abstractmethod
    def save_attempt(self, history: UserQuestionHistory) -> None:
        pass

    @abstractmethod
    def get_summary(self, user_id: int) -> dict:
        pass

    @abstractmethod
    def has_attempted(self, user_id: int, question_id: str) -> bool:
        pass