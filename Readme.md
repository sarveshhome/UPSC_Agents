# UPSC Master

An intelligent UPSC preparation platform built with **FastAPI**, **Python**, and **Clean Architecture**. The system minimizes LLM cost by serving questions from a local database first, generating new ones with **Cohere** only when needed, and persisting all AI-generated content for reuse.

---

## Tech Stack

- **FastAPI** — async REST framework
- **SQLite / PostgreSQL** — question pool & user history
- **Cohere** (`command-r-08-2024`) — LLM fallback for question generation
- **Uvicorn** — ASGI server
- **Redis** *(planned)* — caching layer for hot question sets & analytics

---

## Architecture

```
UPSC_Agents/
├── entities/                # Domain models (Question, User, History)
├── use_cases/               # Business logic & services
│   ├── repositories.py      # Repository interfaces (ABC)
│   ├── question_service.py  # DB-first question delivery + LLM fallback
│   └── auth.py              # Registration & authentication flows
├── interface_adapters/      # Controllers & gateways
│   ├── controllers/
│   │   └── auth_controller.py
│   └── gateways/
│       ├── database_gateway.py   # SQLite user & session repos
│       └── question_gateway.py   # SQLite question & history repos
├── frameworks_drivers/      # External adapters (DB, LLM, cache)
├── main.py                  # FastAPI app & route definitions
├── llm.py                   # Cohere client with retry & error handling
├── prompt.md                # System prompt for question generation
├── schema_questions.sql     # Production PostgreSQL DDL
└── requirements.txt
```

### Layers

| Layer | Responsibility |
|-------|----------------|
| `entities` | Pure dataclasses; no framework dependencies |
| `use_cases` | Orchestration, validation, DB-first/LLM-fallback logic |
| `interface_adapters` | Controllers, gateways, DTOs |
| `frameworks_drivers` | SQLite, Cohere SDK, future Redis client |

---

## Concept of Operation: DB-First Question Delivery

When a client requests questions:

1. **Query database** for unattempted questions matching `subject`, `topic`, `difficulty`.
2. **Exclude** questions the user has already answered (`user_question_history`).
3. **Return** from database if enough are available.
4. **Fallback to Cohere** only when the DB has fewer than `count` questions.
5. **Persist** every AI-generated question into the shared question pool; all future users can use them without calling the LLM again.

This pattern drastically reduces LLM token cost at scale.

---

## Setup

### 1. Install dependencies
```bash
python3 -m pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your real Cohere API key:
# COHERE_API_KEY=<your_key>
# COHERE_MODEL=command-r-08-2024
```

> **Note:** The local dev database is SQLite (`users.db`). It is created automatically on first run.

### 3. Start the server
```bash
python3 -m uvicorn main:app --reload
```

Server runs at `http://localhost:8000`

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `COHERE_API_KEY` | Yes | — | Cohere API key |
| `COHERE_MODEL` | No | `command-r-08-2024` | Cohere model ID |
| `LOG_LEVEL` | No | `INFO` | Logging verbosity |
| `LOG_FILE` | No | — | Optional log file path |
| `ADMIN_TOKEN` | No | `admin-secret` | Token for admin endpoints |

---

## Database

### Local Development (SQLite)
The app auto-creates `users.db` with:
- `users`, `sessions`
- `questions`, `question_options`
- `user_question_history`, `ai_generation_log`

### Production (PostgreSQL)
See `schema_questions.sql` for the full DDL including:
- UUID primary keys (`gen_random_uuid`)
- Proper foreign keys & cascades
- Indexes on `questions(subject, topic, difficulty)`, `user_question_history(user_id)`
- `ai_generation_log` for auditing LLM usage

---

## Key Features

- **Authentication** — register, login, token-based sessions
- **Question delivery** — DB-first with Cohere fallback
- **Answer submission** — instant correctness check + history persistence
- **User analytics** — accuracy, streak, weekly/monthly rollups
- **Bookmarks & Notes** — per-user personalization
- **Test history** — full test submission tracking
- **Current affairs** — daily & monthly compilations (LLM-generated)
- **AI recommendations** — weak-topic detection & learning path
- **AI prediction** — success probability & rank forecasting
- **Smart revision planner** — SM-2 spaced repetition algorithm
- **Subscriptions** — free / pro / premium plans
- **Offline sync** — question bank download + notes/bookmarks sync
- **Admin module** — question CRUD, user stats, platform analytics

---

## Core Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | No | Register a new user |
| `POST` | `/login` | No | Login, returns bearer token |
| `POST` | `/logout` | Yes | Invalidate session |
| `GET` | `/next` | Yes | Fetch next question |
| `POST` | `/answer` | Yes | Submit answer for active question |
| `GET` | `/subjects` | Yes | List available subjects |
| `GET` | `/topics?subject=...` | Yes | List topics for a subject |
| `GET` | `/questions?subject=&topic=&difficulty=` | Yes | Get filtered question set |
| `POST` | `/test/submit` | Yes | Save test result |
| `GET` | `/test/history` | Yes | User test history |
| `GET` | `/api/v1/questions?subject=&topic=&difficulty=&count=` | Yes | v1 question endpoint |
| `POST` | `/api/v1/questions/submit` | Yes | v1 answer submission |
| `GET` | `/api/v1/users/me/history` | Yes | v1 user stats |
| `GET` | `/analytics/summary` | Yes | Overall accuracy & streak |
| `GET` | `/ai/recommendations` | Yes | Personalized learning path |
| `GET` | `/revision/schedule` | Yes | SM-2 revision queue |

> All authenticated endpoints require a `Bearer <token>` header obtained from `/login`.

---

## Example Client Flow

```bash
# 1. Register
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirant","username":"upsc2026","password":"secret"}'

# 2. Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"upsc2026","password":"secret"}'
# → {"token":"eyJ..."}

# 3. Get questions (v1)
curl "http://localhost:8000/api/v1/questions?subject=Indian Polity&topic=Fundamental Rights&difficulty=medium&count=10" \
  -H "Authorization: Bearer <token>"

# 4. Submit answer
curl -X POST http://localhost:8000/api/v1/questions/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"questionId":"...","selectedOption":"Option2","timeTaken":25}'

# 5. View history
curl http://localhost:8000/api/v1/users/me/history \
  -H "Authorization: Bearer <token>"
```

---

## Production Deployment Strategy

- Replace SQLite with the PostgreSQL schema in `schema_questions.sql`
- Add **SQLAlchemy** ORM layer on top of raw SQL for migrations
- Deploy **Redis** for:
  - Question set caching (`questions:{subject}:{difficulty}`)
  - User dashboard stats (`user:{id}:stats`)
  - Analytics rollups
- Add **Gunicorn + Uvicorn workers** or **Kubernetes** deployment
- Enable **CORS** to specific origins; rotate `ADMIN_TOKEN`
- Add **rate limiting** on LLM-heavy endpoints
- Run `ai_generation_log` queries to monitor cost & prompt quality

---


```
# After making API calls, run these to verify storage:
sqlite3 users.db "SELECT COUNT(*) as total FROM questions;"
sqlite3 users.db "SELECT COUNT(*) as llm_calls FROM ai_generation_log;"
sqlite3 users.db "SELECT subject, COUNT(*) as cnt FROM questions GROUP BY subject;"
sqlite3 users.db "SELECT * FROM ai_generation_log ORDER BY generated_at DESC LIMIT 5;"

```
## License

MIT
