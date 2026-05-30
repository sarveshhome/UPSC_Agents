from entities.user import User
from use_cases.repositories import UserRepository, SessionRepository
import sqlite3
from datetime import datetime, timedelta
import secrets
from typing import Optional

DB_PATH = "users.db"


class SQLiteUserRepository(UserRepository):
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_tables()

    def _init_tables(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def find_by_username(self, username: str) -> Optional[User]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, name, username, password FROM users WHERE username = ?",
            (username,),
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return User(id=row[0], name=row[1], username=row[2], password=row[3])
        return None

    def save(self, user: User) -> bool:
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
                (user.name, user.username, user.password),
            )
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            return False


class SQLiteSessionRepository(SessionRepository):
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_tables()

    def _init_tables(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                token TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def create(self, username: str) -> str:
        token = secrets.token_urlsafe(32)
        now = datetime.utcnow()
        expires_at = now + timedelta(minutes=5)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sessions (username, token, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (username, token, now.isoformat(), expires_at.isoformat()),
        )
        conn.commit()
        conn.close()
        return token

    def validate(self, token: str) -> bool:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT expires_at FROM sessions WHERE token = ?", (token,)
        )
        session = cursor.fetchone()
        conn.close()
        if not session:
            return False
        expires_at = datetime.fromisoformat(session[0])
        return datetime.utcnow() < expires_at

    def delete_expired(self) -> None:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM sessions WHERE expires_at < ?",
            (datetime.utcnow().isoformat(),),
        )
        conn.commit()
        conn.close()