import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import cohere

app = FastAPI()
client = cohere.ClientV2()

PROMPT = Path("prompt.md").read_text()

current_question: dict = {}


def ask_llm(user_message: str) -> dict:
    response = client.chat(
        model="command-r-08-2024",
        messages=[
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": user_message},
        ],
    )
    return json.loads(response.message.content[0].text)


@app.get("/next")
def next_question():
    global current_question
    current_question = ask_llm("next")
    return current_question


class AnswerRequest(BaseModel):
    answer: str  # e.g. "Option1" or "Option1,Option3"


@app.post("/answer")
def check_answer(body: AnswerRequest):
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
