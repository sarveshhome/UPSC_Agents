from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
import os, uuid
from typing import Optional, List
from datetime import datetime

load_dotenv()

from Lib.logging import setup_logging, get_logger

# Initialize logging
log_level = os.getenv("LOG_LEVEL", "INFO")
log_file = os.getenv("LOG_FILE")  # Optional: e.g., "logs/app.log"
setup_logging(log_level=log_level, log_file=log_file)

logger = get_logger(__name__)
logger.info("Logging initialized")
logger.debug("Debug logging test")

from fastapi.middleware.cors import CORSMiddleware

from llm import ask_llm
from interface_adapters.gateways.database_gateway import SQLiteUserRepository, SQLiteSessionRepository
from use_cases.auth import RegisterUser, AuthenticateUser
from interface_adapters.controllers.auth_controller import AuthController, LoginRequest, LoginResponse, RegisterRequest

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

user_repo = SQLiteUserRepository()
session_repo = SQLiteSessionRepository()
register_user = RegisterUser(user_repo)
authenticate_user = AuthenticateUser(user_repo, session_repo)
auth_controller = AuthController(register_user, authenticate_user)

security = HTTPBearer()
current_question: dict = {}


@app.post("/register")
def register(body: RegisterRequest):
    return auth_controller.register(body)


@app.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    return auth_controller.login(body)


@app.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return auth_controller.logout(token)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    logger.debug(f"Auth attempt - Token prefix: {token[:10] if token else 'None'}")
    
    if not session_repo.validate(token):
        logger.warning(f"Auth failed - Invalid token prefix: {token[:10] if token else 'None'}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    logger.info("Auth successful")
    return token


@app.get("/next")
def next_question(current_user: str = Depends(get_current_user)):
    global current_question
    logger.info("Fetching next question for user")
    try:
        current_question = ask_llm("next")
        logger.debug("Question fetched successfully")
        return current_question
    except Exception as e:
        logger.error("LLM request failed", exc_info=True)
        raise


class AnswerRequest(BaseModel):
    answer: str


@app.post("/answer")
def check_answer(body: AnswerRequest, current_user: str = Depends(get_current_user)):
    if not current_question:
        raise HTTPException(status_code=400, detail="No active question. Call /next first.")

    correct = set(current_question["Ans"].split(","))
    given = set(a.strip() for a in body.answer.split(","))

    return {
        "correct": correct == given,
        "your_answer": body.answer,
        "correct_answer": current_question["Ans"],
        "question": current_question["Ques"],
    }


# ── Phase 2: Assessment System ────────────────────────────────

# In-memory stores (replace with PostgreSQL in production)
_test_history: list = []
_bookmarks: dict = {}   # user_token -> list[dict]
_notes: dict = {}       # user_token -> list[dict]

SUBJECTS = ["Physics", "Chemistry", "Biology", "Environment", "Space Science", "Biotechnology", "General Science"]


@app.get("/subjects")
def get_subjects(current_user: str = Depends(get_current_user)):
    return SUBJECTS


@app.get("/topics")
def get_topics(subject: str, current_user: str = Depends(get_current_user)):
    topics = ask_llm(f"list 8 key topics for UPSC {subject} in JSON array format, return only array")
    return topics


@app.get("/questions")
def get_questions(subject: Optional[str] = None, difficulty: Optional[str] = None, topic: Optional[str] = None,
                  current_user: str = Depends(get_current_user)):
    prompt = f"generate 10 UPSC Science MCQ questions"
    if subject: prompt += f" on {subject}"
    if topic: prompt += f" topic {topic}"
    if difficulty: prompt += f" difficulty {difficulty}"
    prompt += " as JSON array using schema: [{Ques,Option1..5,Ans,subject,difficulty}]"
    return ask_llm(prompt)


# ── Test endpoints ──

class TestResultRequest(BaseModel):
    totalQuestions: int
    correct: int
    incorrect: int
    unattempted: int
    score: float
    timeTaken: int
    subjectBreakdown: dict


@app.get("/test/questions")
def get_test_questions(type: str, count: int = 10, subject: Optional[str] = None,
                       current_user: str = Depends(get_current_user)):
    prompt = f"generate {count} UPSC Science MCQ questions for a {type} test"
    if subject: prompt += f" on {subject}"
    prompt += " as JSON array [{Ques,Option1..5,Ans,subject,difficulty}]"
    return ask_llm(prompt)


@app.post("/test/submit")
def submit_test(body: TestResultRequest, current_user: str = Depends(get_current_user)):
    record = {"id": str(uuid.uuid4()), **body.model_dump(), "submittedAt": datetime.utcnow().isoformat()}
    _test_history.append(record)
    return {"id": record["id"]}


@app.get("/test/history")
def test_history(current_user: str = Depends(get_current_user)):
    return _test_history


# ── Search endpoint ──

@app.get("/search")
def search(query: str, subject: Optional[str] = None, difficulty: Optional[str] = None,
           current_user: str = Depends(get_current_user)):
    prompt = f"generate 10 UPSC MCQ questions matching '{query}'"
    if subject: prompt += f" subject {subject}"
    if difficulty: prompt += f" difficulty {difficulty}"
    prompt += " as JSON array [{Ques,Option1..5,Ans,subject,difficulty}]"
    return ask_llm(prompt)


# ── Bookmark endpoints ──

class BookmarkRequest(BaseModel):
    questionId: str
    note: Optional[str] = None


@app.get("/bookmarks")
def get_bookmarks(current_user: str = Depends(get_current_user)):
    return _bookmarks.get(current_user, [])


@app.post("/bookmarks")
def add_bookmark(body: BookmarkRequest, current_user: str = Depends(get_current_user)):
    if current_user not in _bookmarks:
        _bookmarks[current_user] = []
    record = {"id": str(uuid.uuid4()), "questionId": body.questionId, "note": body.note, "createdAt": datetime.utcnow().isoformat()}
    _bookmarks[current_user].append(record)
    return record


@app.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(bookmark_id: str, current_user: str = Depends(get_current_user)):
    if current_user in _bookmarks:
        _bookmarks[current_user] = [b for b in _bookmarks[current_user] if b["id"] != bookmark_id]
    return {"success": True}


# ── Notes endpoints ──

class NoteRequest(BaseModel):
    title: str
    content: str
    subject: Optional[str] = None


@app.get("/notes")
def get_notes(current_user: str = Depends(get_current_user)):
    return _notes.get(current_user, [])


@app.post("/notes")
def create_note(body: NoteRequest, current_user: str = Depends(get_current_user)):
    if current_user not in _notes:
        _notes[current_user] = []
    now = datetime.utcnow().isoformat()
    record = {"id": str(uuid.uuid4()), **body.model_dump(), "createdAt": now, "updatedAt": now}
    _notes[current_user].append(record)
    return record


@app.put("/notes/{note_id}")
def update_note(note_id: str, body: NoteRequest, current_user: str = Depends(get_current_user)):
    for n in _notes.get(current_user, []):
        if n["id"] == note_id:
            n.update({**body.model_dump(), "updatedAt": datetime.utcnow().isoformat()})
            return n
    raise HTTPException(status_code=404, detail="Note not found")


@app.delete("/notes/{note_id}")
def delete_note(note_id: str, current_user: str = Depends(get_current_user)):
    if current_user in _notes:
        _notes[current_user] = [n for n in _notes[current_user] if n["id"] != note_id]
    return {"success": True}