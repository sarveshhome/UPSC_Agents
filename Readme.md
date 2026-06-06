# UPSC Science MCQ Agent

A REST API that generates UPSC-style Science MCQ questions using the Cohere AI model, with user authentication and a React frontend.

## Tech Stack

- **FastAPI** — REST API framework
- **Cohere** (`command-r-08-2024`) — LLM for question generation
- **SQLite** — User and session storage
- **Uvicorn** — ASGI server
- **React + Redux** — Frontend UI (`upscagentui/`)

## Project Structure

```
UPSC_Agents/
├── main.py                          # FastAPI application & routes
├── llm.py                           # Cohere LLM integration
├── prompt.md                        # System prompt for Cohere model
├── promptui.md                      # UI-related prompt
├── requirements.txt                 # Python dependencies
├── Procfile                         # Deployment config
├── .env.example                     # Environment variable template
├── entities/                        # Domain models (User)
├── use_cases/                       # Business logic (auth, repositories)
├── interface_adapters/
│   ├── controllers/                 # Request/response handling
│   └── gateways/                    # DB access (SQLite)
├── frameworks_drivers/db/           # DB setup
├── Lib/logging/                     # Logging setup
└── upscagentui/                     # React frontend
```

## Setup

**1. Install dependencies**
```bash
python3 -m pip install -r requirements.txt
```

**2. Configure environment**
```bash
cp .env.example .env
```
Edit `.env` and set:
```
COHERE_API_KEY=<your_cohere_api_key>
COHERE_MODEL=command-r7b-12-2024
```
Get your key at [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)

**3. Start the server**
```bash
python3 -m uvicorn main:app --reload
```

Server runs at `http://localhost:8000`

---

## API Endpoints

> All `/next` and `/answer` endpoints require a Bearer token from `/login`.

### POST `/register`
Register a new user.

```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "username": "john", "password": "secret"}'
```

**Response:**
```json
{ "success": true, "message": "User registered successfully" }
```

---

### POST `/login`
Login and get an auth token.

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "secret"}'
```

**Response:**
```json
{ "success": true, "token": "<bearer_token>", "message": "Login successful" }
```

---

### POST `/logout`
Invalidate the current session token.

```bash
curl -X POST http://localhost:8000/logout \
  -H "Authorization: Bearer <token>"
```

---

### GET `/next`
Generates a new UPSC Science MCQ question.

```bash
curl http://localhost:8000/next \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "Ques": "Which gas is essential for photosynthesis?",
  "Option1": "Oxygen",
  "Option2": "Carbon dioxide",
  "Option3": "Nitrogen",
  "Option4": "Hydrogen",
  "Option5": "Helium",
  "Ans": "Option2"
}
```

---

### POST `/answer`
Submit your answer for the current question.

```bash
curl -X POST http://localhost:8000/answer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"answer": "Option2"}'
```

Multiple answers:
```bash
-d '{"answer": "Option1,Option3"}'
```

**Response:**
```json
{
  "correct": true,
  "your_answer": "Option2",
  "correct_answer": "Option2",
  "question": "Which gas is essential for photosynthesis?"
}
```

---

## Notes

- Always call `/next` before `/answer`
- Questions cover Physics, Chemistry, Biology, Environmental Science, Space Science, Biotechnology, and General Science
- Questions can have single or multiple correct answers

---

## How `prompt.md` was generated

```
You are a UPSC exam expert.
I need your assistance to get questions for practicing the Science paper.
Give me a unique question when I type "next" with 5 options and the correct answer in JSON format.
Questions are multiple choice (MCQ).

JSON format:
{
  "Ques": "Question description here",
  "Option1": "",
  "Option2": "",
  "Option3": "",
  "Option4": "",
  "Option5": "",
  "Ans": "Option1,Option3,Option5"
}
```

Then in ChatGPT: *"Generate the reverse prompt which I can use in programming and pass as a system prompt to an LLM"*

---

<img width="1212" height="1518" alt="image" src="https://github.com/user-attachments/assets/d6179bc2-9170-4740-b18a-a1932794f3fe" />

<img width="1212" height="1518" alt="image" src="https://github.com/user-attachments/assets/1a15f0a6-17c4-4512-a209-e6941c7c14fc" />
