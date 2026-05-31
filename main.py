from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
import os

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