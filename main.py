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


# ── Phase 3: Analytics ────────────────────────────────────────

from collections import defaultdict
import re

def _build_subject_stats(history: list) -> list:
    agg: dict = defaultdict(lambda: {"total": 0, "correct": 0})
    for r in history:
        for subj, data in r.get("subjectBreakdown", {}).items():
            agg[subj]["total"] += data.get("total", 0)
            agg[subj]["correct"] += data.get("correct", 0)
    stats = []
    for subj, d in agg.items():
        acc = round(d["correct"] / d["total"] * 100, 1) if d["total"] else 0
        stats.append({"subject": subj, "total": d["total"], "correct": d["correct"], "accuracy": acc})
    return stats


def _iso_week(dt_str: str) -> str:
    dt = datetime.fromisoformat(dt_str)
    return f"{dt.isocalendar()[0]}-W{dt.isocalendar()[1]:02d}"


def _month_str(dt_str: str) -> str:
    return dt_str[:7]


@app.get("/analytics/summary")
def analytics_summary(current_user: str = Depends(get_current_user)):
    history = _test_history
    total = sum(r["totalQuestions"] for r in history)
    correct = sum(r["correct"] for r in history)
    accuracy = round(correct / total * 100, 1) if total else 0

    # streak: consecutive days with at least one submission
    dates = sorted({r["submittedAt"][:10] for r in history}, reverse=True)
    streak = 0
    from datetime import date, timedelta
    today = date.today()
    for i, d in enumerate(dates):
        if date.fromisoformat(d) == today - timedelta(days=i):
            streak += 1
        else:
            break

    # weekly / monthly rollups
    weekly: dict = defaultdict(lambda: {"totalAttempted": 0, "correct": 0, "scores": [], "subj": defaultdict(lambda: {"total": 0, "correct": 0})})
    monthly: dict = defaultdict(lambda: {"totalAttempted": 0, "correct": 0, "scores": [], "subj": defaultdict(lambda: {"total": 0, "correct": 0}), "weeks": set()})

    for r in history:
        w = _iso_week(r["submittedAt"])
        m = _month_str(r["submittedAt"])
        weekly[w]["totalAttempted"] += r["totalQuestions"]
        weekly[w]["correct"] += r["correct"]
        weekly[w]["scores"].append(r["score"])
        monthly[m]["totalAttempted"] += r["totalQuestions"]
        monthly[m]["correct"] += r["correct"]
        monthly[m]["scores"].append(r["score"])
        monthly[m]["weeks"].add(w)
        for subj, d in r.get("subjectBreakdown", {}).items():
            weekly[w]["subj"][subj]["total"] += d.get("total", 0)
            weekly[w]["subj"][subj]["correct"] += d.get("correct", 0)
            monthly[m]["subj"][subj]["total"] += d.get("total", 0)
            monthly[m]["subj"][subj]["correct"] += d.get("correct", 0)

    def _subj_stats(subj_dict):
        return [{"subject": s, "total": v["total"], "correct": v["correct"],
                 "accuracy": round(v["correct"] / v["total"] * 100, 1) if v["total"] else 0}
                for s, v in subj_dict.items()]

    weekly_reports = [{"week": w, "totalAttempted": v["totalAttempted"],
                        "accuracy": round(v["correct"] / v["totalAttempted"] * 100, 1) if v["totalAttempted"] else 0,
                        "avgScore": round(sum(v["scores"]) / len(v["scores"]), 1) if v["scores"] else 0,
                        "subjectStats": _subj_stats(v["subj"])} for w, v in sorted(weekly.items())]

    monthly_reports = [{"month": m, "totalAttempted": v["totalAttempted"],
                         "accuracy": round(v["correct"] / v["totalAttempted"] * 100, 1) if v["totalAttempted"] else 0,
                         "avgScore": round(sum(v["scores"]) / len(v["scores"]), 1) if v["scores"] else 0,
                         "subjectStats": _subj_stats(v["subj"]),
                         "weeklyBreakdown": [wr for wr in weekly_reports if wr["week"] in v["weeks"]]}
                        for m, v in sorted(monthly.items())]

    return {"overallAccuracy": accuracy, "totalAttempted": total, "streak": streak,
            "subjectStats": _build_subject_stats(history),
            "weeklyReports": weekly_reports, "monthlyReports": monthly_reports}


@app.get("/analytics/weekly")
def analytics_weekly(week: str, current_user: str = Depends(get_current_user)):
    records = [r for r in _test_history if _iso_week(r["submittedAt"]) == week]
    if not records:
        raise HTTPException(status_code=404, detail="No data for this week")
    total = sum(r["totalQuestions"] for r in records)
    correct = sum(r["correct"] for r in records)
    scores = [r["score"] for r in records]
    return {"week": week, "totalAttempted": total,
            "accuracy": round(correct / total * 100, 1) if total else 0,
            "avgScore": round(sum(scores) / len(scores), 1),
            "subjectStats": _build_subject_stats(records)}


@app.get("/analytics/monthly")
def analytics_monthly(month: str, current_user: str = Depends(get_current_user)):
    records = [r for r in _test_history if _month_str(r["submittedAt"]) == month]
    if not records:
        raise HTTPException(status_code=404, detail="No data for this month")
    total = sum(r["totalQuestions"] for r in records)
    correct = sum(r["correct"] for r in records)
    scores = [r["score"] for r in records]
    weeks = sorted({_iso_week(r["submittedAt"]) for r in records})

    def _weekly_breakdown(w):
        recs = [r for r in records if _iso_week(r["submittedAt"]) == w]
        t = sum(r["totalQuestions"] for r in recs)
        c = sum(r["correct"] for r in recs)
        sc = [r["score"] for r in recs]
        return {"week": w, "totalAttempted": t,
                "accuracy": round(c / t * 100, 1) if t else 0,
                "avgScore": round(sum(sc) / len(sc), 1) if sc else 0,
                "subjectStats": _build_subject_stats(recs)}

    return {"month": month, "totalAttempted": total,
            "accuracy": round(correct / total * 100, 1) if total else 0,
            "avgScore": round(sum(scores) / len(scores), 1),
            "subjectStats": _build_subject_stats(records),
            "weeklyBreakdown": [_weekly_breakdown(w) for w in weeks]}


# ── Phase 3: Notifications ────────────────────────────────────

_notification_prefs: dict = {}  # token -> prefs

_default_prefs = {
    "studyReminder": True,
    "studyReminderTime": "08:00",
    "testReminder": True,
    "testReminderTime": "18:00",
    "currentAffairs": True,
}


class NotificationPrefsRequest(BaseModel):
    studyReminder: Optional[bool] = None
    studyReminderTime: Optional[str] = None
    testReminder: Optional[bool] = None
    testReminderTime: Optional[str] = None
    currentAffairs: Optional[bool] = None


@app.get("/notifications/prefs")
def get_notification_prefs(current_user: str = Depends(get_current_user)):
    return _notification_prefs.get(current_user, _default_prefs)


@app.put("/notifications/prefs")
def update_notification_prefs(body: NotificationPrefsRequest, current_user: str = Depends(get_current_user)):
    prefs = dict(_notification_prefs.get(current_user, _default_prefs))
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    prefs.update(updates)
    _notification_prefs[current_user] = prefs
    return prefs


# ── Phase 3: Current Affairs ──────────────────────────────────

@app.get("/current-affairs/daily")
def daily_current_affairs(current_user: str = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    prompt = (
        f"Generate 5 current affairs articles relevant to UPSC exam for {today}. "
        "Return a JSON array with schema: "
        '[{{"id":"uuid","title":"","summary":"2-3 sentences","source":"","subject":"","date":""}}]'
    )
    return ask_llm(prompt)


@app.get("/current-affairs/monthly")
def monthly_compilation_index(current_user: str = Depends(get_current_user)):
    from datetime import date
    today = date.today()
    months = []
    for i in range(3):
        m = today.replace(day=1)
        from dateutil.relativedelta import relativedelta
        m = m - relativedelta(months=i)
        months.append({"month": m.strftime("%Y-%m"), "articleCount": 30})
    return months


@app.get("/current-affairs/quiz")
def current_affairs_quiz(month: str, current_user: str = Depends(get_current_user)):
    prompt = (
        f"Generate 5 UPSC current affairs MCQ questions for {month}. "
        "Return JSON: {{\"id\":\"\",\"month\":\"{month}\",\"questions\":[{{Ques,Option1..5,Ans,subject}}]}}"
    )
    return ask_llm(prompt)
