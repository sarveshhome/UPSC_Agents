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


# ── Phase 4: Gamification & Community ────────────────────────

from math import floor

# ── In-memory stores (replace with PostgreSQL in production) ──

_user_xp: dict = {}          # token -> {total_xp, level}
_xp_events: list = []
_user_badges: dict = {}      # token -> list[badge_id]
_user_streaks: dict = {}     # token -> {current, longest, last_activity}
_leaderboard: list = []      # [{user_id, username, xp_this_week, state}]
_community_posts: list = []
_post_likes: dict = {}       # post_id -> set(user_token)

BADGE_DEFINITIONS = [
    {"id": "first_answer",    "name": "First Step",     "icon": "🎯", "xp_reward": 10,  "criteria": {"type": "correct_answers", "threshold": 1}},
    {"id": "streak_3",        "name": "3-Day Streak",   "icon": "🔥", "xp_reward": 30,  "criteria": {"type": "streak",          "threshold": 3}},
    {"id": "streak_7",        "name": "Weekly Warrior", "icon": "⚡", "xp_reward": 100, "criteria": {"type": "streak",          "threshold": 7}},
    {"id": "streak_30",       "name": "Iron Will",      "icon": "💎", "xp_reward": 500, "criteria": {"type": "streak",          "threshold": 30}},
    {"id": "correct_10",      "name": "Sharp Mind",     "icon": "🧠", "xp_reward": 50,  "criteria": {"type": "correct_answers", "threshold": 10}},
    {"id": "correct_100",     "name": "Century",        "icon": "💯", "xp_reward": 200, "criteria": {"type": "correct_answers", "threshold": 100}},
    {"id": "test_complete_1", "name": "Test Taker",     "icon": "📝", "xp_reward": 50,  "criteria": {"type": "tests_completed", "threshold": 1}},
    {"id": "test_complete_10","name": "Test Master",    "icon": "🏆", "xp_reward": 300, "criteria": {"type": "tests_completed", "threshold": 10}},
    {"id": "level_5",         "name": "Rising Star",    "icon": "⭐", "xp_reward": 0,   "criteria": {"type": "level",           "threshold": 5}},
    {"id": "level_10",        "name": "Expert",         "icon": "🌟", "xp_reward": 0,   "criteria": {"type": "level",           "threshold": 10}},
]

XP_TABLE = {
    "answer_correct":  10,
    "answer_wrong":    2,
    "test_complete":   50,
    "streak_bonus":    20,  # per day on streak
    "badge_earned":    0,   # badge itself carries xp_reward
}


# ── XP Engine ────────────────────────────────────────────────

def _xp_to_level(xp: int) -> int:
    """Level = floor(sqrt(xp / 100)) + 1, capped at 50."""
    return min(50, floor((xp / 100) ** 0.5) + 1)


def _award_xp(user: str, event_type: str, extra: int = 0, metadata: dict = None) -> dict:
    base = XP_TABLE.get(event_type, 0) + extra
    state = _user_xp.setdefault(user, {"total_xp": 0, "level": 1})
    state["total_xp"] += base
    new_level = _xp_to_level(state["total_xp"])
    leveled_up = new_level > state["level"]
    state["level"] = new_level
    _xp_events.append({
        "id": str(uuid.uuid4()), "user_id": user,
        "event_type": event_type, "xp_awarded": base,
        "metadata": metadata or {}, "created_at": datetime.utcnow().isoformat()
    })
    # Update weekly leaderboard
    today = datetime.utcnow().date()
    week_start = str(today - __import__('datetime').timedelta(days=today.weekday()))
    entry = next((e for e in _leaderboard if e["user_id"] == user and e.get("week_start") == week_start), None)
    if entry:
        entry["xp_this_week"] += base
    else:
        _leaderboard.append({"user_id": user, "username": user[:12], "xp_this_week": base,
                              "week_start": week_start, "state": None, "rank": 0})
    return {"xp_awarded": base, "total_xp": state["total_xp"], "level": new_level, "leveled_up": leveled_up}


# ── Badge Engine ─────────────────────────────────────────────

def _check_badges(user: str) -> list:
    earned = _user_badges.setdefault(user, [])
    xp_state = _user_xp.get(user, {"total_xp": 0, "level": 1})
    streak = _user_streaks.get(user, {"current": 0})
    correct_count = sum(1 for e in _xp_events if e["user_id"] == user and e["event_type"] == "answer_correct")
    tests_count   = sum(1 for e in _xp_events if e["user_id"] == user and e["event_type"] == "test_complete")

    counters = {
        "correct_answers": correct_count,
        "streak":          streak.get("current", 0),
        "tests_completed": tests_count,
        "level":           xp_state["level"],
    }
    newly_earned = []
    for badge in BADGE_DEFINITIONS:
        if badge["id"] in earned:
            continue
        ctype, threshold = badge["criteria"]["type"], badge["criteria"]["threshold"]
        if counters.get(ctype, 0) >= threshold:
            earned.append(badge["id"])
            if badge["xp_reward"]:
                _award_xp(user, "badge_earned", extra=badge["xp_reward"], metadata={"badge_id": badge["id"]})
            newly_earned.append(badge)
            # auto-post to community
            _community_posts.insert(0, {
                "id": str(uuid.uuid4()), "user_id": user, "username": user[:12],
                "post_type": "achievement",
                "content": f"Just earned the '{badge['name']}' {badge['icon']} badge!",
                "metadata": {"badge_id": badge["id"]}, "likes": 0,
                "created_at": datetime.utcnow().isoformat()
            })
    return newly_earned


# ── Streak Logic ─────────────────────────────────────────────

def _update_streak(user: str) -> dict:
    today = datetime.utcnow().date()
    s = _user_streaks.setdefault(user, {"current": 0, "longest": 0, "last_activity": None})
    last = s["last_activity"]
    if last is None:
        s["current"] = 1
    elif last == str(today):
        pass  # already updated today
    elif last == str(today - __import__('datetime').timedelta(days=1)):
        s["current"] += 1
        _award_xp(user, "streak_bonus", metadata={"streak": s["current"]})
    else:
        s["current"] = 1  # streak broken
    s["last_activity"] = str(today)
    s["longest"] = max(s["longest"], s["current"])
    return s


# ── Gamification Endpoints ────────────────────────────────────

@app.get("/gamification/profile")
def gamification_profile(current_user: str = Depends(get_current_user)):
    xp   = _user_xp.get(current_user, {"total_xp": 0, "level": 1})
    streak = _user_streaks.get(current_user, {"current": 0, "longest": 0, "last_activity": None})
    badges = [b for b in BADGE_DEFINITIONS if b["id"] in _user_badges.get(current_user, [])]
    next_level_xp = ((xp["level"]) ** 2) * 100
    return {
        "total_xp":      xp["total_xp"],
        "level":         xp["level"],
        "next_level_xp": next_level_xp,
        "current_streak": streak["current"],
        "longest_streak": streak["longest"],
        "badges":        badges,
        "badge_count":   len(badges),
    }


@app.post("/gamification/activity")
def record_activity(current_user: str = Depends(get_current_user)):
    """Call after any learning activity to update streak + award XP."""
    streak  = _update_streak(current_user)
    xp_info = _award_xp(current_user, "answer_correct")
    new_badges = _check_badges(current_user)
    return {"xp": xp_info, "streak": streak, "new_badges": new_badges}


@app.get("/gamification/badges")
def get_all_badges(current_user: str = Depends(get_current_user)):
    earned = _user_badges.get(current_user, [])
    return [{"earned": b["id"] in earned, **b} for b in BADGE_DEFINITIONS]


@app.get("/gamification/xp-events")
def xp_history(current_user: str = Depends(get_current_user)):
    return [e for e in _xp_events if e["user_id"] == current_user][-20:]


# ── Leaderboard Endpoints ─────────────────────────────────────

def _ranked(entries: list) -> list:
    ranked = sorted(entries, key=lambda x: x["xp_this_week"], reverse=True)
    for i, e in enumerate(ranked, 1):
        e["rank"] = i
    return ranked


@app.get("/leaderboard/global")
def leaderboard_global(current_user: str = Depends(get_current_user)):
    today = datetime.utcnow().date()
    week_start = str(today - __import__('datetime').timedelta(days=today.weekday()))
    entries = [e for e in _leaderboard if e.get("week_start") == week_start]
    return _ranked(entries)[:100]


@app.get("/leaderboard/weekly")
def leaderboard_weekly(current_user: str = Depends(get_current_user)):
    return leaderboard_global(current_user)


@app.get("/leaderboard/state")
def leaderboard_state(state: str, current_user: str = Depends(get_current_user)):
    today = datetime.utcnow().date()
    week_start = str(today - __import__('datetime').timedelta(days=today.weekday()))
    entries = [e for e in _leaderboard if e.get("week_start") == week_start and e.get("state") == state]
    return _ranked(entries)[:100]


@app.get("/leaderboard/me")
def my_rank(current_user: str = Depends(get_current_user)):
    ranked = leaderboard_global(current_user)
    entry = next((e for e in ranked if e["user_id"] == current_user), None)
    return entry or {"rank": None, "xp_this_week": 0}


# ── Community Endpoints ───────────────────────────────────────

class CommunityPostRequest(BaseModel):
    content: str
    post_type: str = "general"
    metadata: Optional[dict] = None


@app.get("/community/feed")
def community_feed(page: int = 0, limit: int = 20, current_user: str = Depends(get_current_user)):
    start = page * limit
    posts = _community_posts[start: start + limit]
    return [{"liked_by_me": current_user in _post_likes.get(p["id"], set()), **p} for p in posts]


@app.post("/community/post")
def create_post(body: CommunityPostRequest, current_user: str = Depends(get_current_user)):
    post = {
        "id": str(uuid.uuid4()), "user_id": current_user,
        "username": current_user[:12], "post_type": body.post_type,
        "content": body.content, "metadata": body.metadata or {},
        "likes": 0, "liked_by_me": False,
        "created_at": datetime.utcnow().isoformat()
    }
    _community_posts.insert(0, post)
    return post


@app.post("/community/post/{post_id}/like")
def toggle_like(post_id: str, current_user: str = Depends(get_current_user)):
    post = next((p for p in _community_posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    likes_set = _post_likes.setdefault(post_id, set())
    if current_user in likes_set:
        likes_set.discard(current_user)
        post["likes"] = max(0, post["likes"] - 1)
        liked = False
    else:
        likes_set.add(current_user)
        post["likes"] += 1
        liked = True
    return {"liked": liked, "likes": post["likes"]}


@app.post("/community/invite")
def invite_friend(current_user: str = Depends(get_current_user)):
    xp_info = _award_xp(current_user, "answer_correct", extra=50, metadata={"reason": "invite"})
    _community_posts.insert(0, {
        "id": str(uuid.uuid4()), "user_id": current_user, "username": current_user[:12],
        "post_type": "invite", "content": "Invited a friend to UPSC Master! 🎉",
        "metadata": {}, "likes": 0, "created_at": datetime.utcnow().isoformat()
    })
    return {"xp": xp_info, "message": "Invite bonus awarded"}
