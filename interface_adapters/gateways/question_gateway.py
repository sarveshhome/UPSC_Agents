import sqlite3
import uuid
import json
from datetime import datetime
from typing import List, Optional

from entities.question import Question, QuestionOption, UserQuestionHistory
from use_cases.repositories import QuestionRepository, UserHistoryRepository

DB_PATH = "users.db"


def _get_conn(db_path: str = DB_PATH):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


class SQLiteQuestionRepository(QuestionRepository):
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_tables()

    def _init_tables(self):
        conn = _get_conn(self.db_path)
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS questions (
                id          TEXT PRIMARY KEY,
                subject     TEXT NOT NULL,
                topic       TEXT,
                difficulty  TEXT DEFAULT 'medium',
                question_text TEXT NOT NULL,
                explanation TEXT,
                source      TEXT DEFAULT 'cohere',
                correct_answer TEXT NOT NULL,
                created_at  TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS question_options (
                id          TEXT PRIMARY KEY,
                question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                option_key  TEXT NOT NULL,
                option_text TEXT NOT NULL,
                is_correct  INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS user_question_history (
                id              TEXT PRIMARY KEY,
                user_id         INTEGER NOT NULL,
                question_id     TEXT NOT NULL,
                selected_option TEXT,
                is_correct      INTEGER,
                time_taken      INTEGER DEFAULT 0,
                is_bookmarked   INTEGER DEFAULT 0,
                attempted_at    TEXT DEFAULT (datetime('now')),
                UNIQUE (user_id, question_id)
            );
            CREATE TABLE IF NOT EXISTS ai_generation_log (
                id                  TEXT PRIMARY KEY,
                prompt              TEXT,
                subject             TEXT,
                topic               TEXT,
                difficulty          TEXT,
                questions_generated INTEGER DEFAULT 0,
                generated_at        TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_q_subject ON questions(subject, topic, difficulty);
            CREATE INDEX IF NOT EXISTS idx_uqh_user  ON user_question_history(user_id);
        """)
        conn.commit()
        conn.close()

    def get_unattempted(self, user_id: int, subject: str, topic: str,
                        difficulty: str, count: int) -> List[Question]:
        conn = _get_conn(self.db_path)
        params = []
        where = ["q.id NOT IN (SELECT question_id FROM user_question_history WHERE user_id = ?)"]
        params.append(user_id)

        if subject:
            where.append("LOWER(q.subject) = LOWER(?)")
            params.append(subject)
        if topic:
            where.append("LOWER(q.topic) = LOWER(?)")
            params.append(topic)
        if difficulty:
            where.append("LOWER(q.difficulty) = LOWER(?)")
            params.append(difficulty)

        sql = f"""
            SELECT q.* FROM questions q
            WHERE {' AND '.join(where)}
            ORDER BY RANDOM()
            LIMIT ?
        """
        params.append(count)
        rows = conn.execute(sql, params).fetchall()
        questions = [self._row_to_question(conn, row) for row in rows]
        conn.close()
        return questions

    def bulk_save(self, questions: List[Question]) -> None:
        conn = _get_conn(self.db_path)
        for q in questions:
            qid = q.id or str(uuid.uuid4())
            conn.execute(
                "INSERT OR IGNORE INTO questions "
                "(id, subject, topic, difficulty, question_text, explanation, source, correct_answer) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (qid, q.subject, q.topic, q.difficulty, q.question_text,
                 q.explanation, q.source, q.correct_answer)
            )
            for opt in q.options:
                conn.execute(
                    "INSERT OR IGNORE INTO question_options (id, question_id, option_key, option_text, is_correct) "
                    "VALUES (?,?,?,?,?)",
                    (str(uuid.uuid4()), qid, opt.option_key, opt.option_text, int(opt.is_correct))
                )
        conn.commit()
        conn.close()

    def get_by_id(self, question_id: str) -> Optional[Question]:
        conn = _get_conn(self.db_path)
        row = conn.execute("SELECT * FROM questions WHERE id = ?", (question_id,)).fetchone()
        q = self._row_to_question(conn, row) if row else None
        conn.close()
        return q

    def log_generation(self, prompt: str, subject: str, topic: str,
                       difficulty: str, count: int) -> None:
        conn = _get_conn(self.db_path)
        conn.execute(
            "INSERT INTO ai_generation_log (id, prompt, subject, topic, difficulty, questions_generated) "
            "VALUES (?,?,?,?,?,?)",
            (str(uuid.uuid4()), prompt, subject, topic, difficulty, count)
        )
        conn.commit()
        conn.close()

    def _row_to_question(self, conn, row) -> Question:
        opts = conn.execute(
            "SELECT * FROM question_options WHERE question_id = ? ORDER BY option_key",
            (row["id"],)
        ).fetchall()
        return Question(
            id=row["id"],
            subject=row["subject"],
            topic=row["topic"] or "",
            difficulty=row["difficulty"],
            question_text=row["question_text"],
            explanation=row["explanation"] or "",
            source=row["source"],
            correct_answer=row["correct_answer"],
            options=[
                QuestionOption(
                    option_key=o["option_key"],
                    option_text=o["option_text"],
                    is_correct=bool(o["is_correct"])
                ) for o in opts
            ],
            created_at=datetime.fromisoformat(row["created_at"]) if row["created_at"] else None
        )


class SQLiteUserHistoryRepository(UserHistoryRepository):
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    def save_attempt(self, history: UserQuestionHistory) -> None:
        conn = _get_conn(self.db_path)
        conn.execute(
            "INSERT OR REPLACE INTO user_question_history "
            "(id, user_id, question_id, selected_option, is_correct, time_taken, is_bookmarked, attempted_at) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (
                history.id or str(uuid.uuid4()),
                history.user_id,
                history.question_id,
                history.selected_option,
                int(history.is_correct) if history.is_correct is not None else None,
                history.time_taken,
                int(history.is_bookmarked),
                (history.attempted_at or datetime.utcnow()).isoformat(),
            )
        )
        conn.commit()
        conn.close()

    def get_summary(self, user_id: int) -> dict:
        conn = _get_conn(self.db_path)
        row = conn.execute("""
            SELECT
                COUNT(*)                            AS total,
                SUM(CASE WHEN is_correct=1 THEN 1 ELSE 0 END) AS correct,
                SUM(CASE WHEN is_correct=0 THEN 1 ELSE 0 END) AS incorrect
            FROM user_question_history WHERE user_id = ?
        """, (user_id,)).fetchone()
        conn.close()
        total = row["total"] or 0
        correct = row["correct"] or 0
        incorrect = row["incorrect"] or 0
        return {
            "totalQuestions": total,
            "correct": correct,
            "incorrect": incorrect,
            "accuracy": round(correct / total * 100, 1) if total else 0,
        }

    def has_attempted(self, user_id: int, question_id: str) -> bool:
        conn = _get_conn(self.db_path)
        row = conn.execute(
            "SELECT 1 FROM user_question_history WHERE user_id=? AND question_id=?",
            (user_id, question_id)
        ).fetchone()
        conn.close()
        return row is not None
