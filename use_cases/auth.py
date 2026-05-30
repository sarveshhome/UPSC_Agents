from entities.user import User
from use_cases.repositories import UserRepository, SessionRepository
from typing import Optional, Tuple


class RegisterUser:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def execute(self, name: str, username: str, password: str) -> Optional[User]:
        user = User(name=name, username=username, password=password)
        if self.user_repo.save(user):
            return user
        return None


class AuthenticateUser:
    def __init__(self, user_repo: UserRepository, session_repo: SessionRepository):
        self.user_repo = user_repo
        self.session_repo = session_repo

    def execute(self, username: str, password: str) -> Tuple[bool, str]:
        user = self.user_repo.find_by_username(username)
        if not user or user.password != password:
            return False, ""
        token = self.session_repo.create(username)
        return True, token