from abc import ABC, abstractmethod
from entities.user import User, Session
from typing import Optional


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