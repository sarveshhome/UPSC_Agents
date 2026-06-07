# UPSC Science MCQ Agent

A REST API that generates UPSC-style Science MCQ questions using the Cohere AI model.

## Tech Stack

- **FastAPI** — REST API framework
- **Cohere** (`command-r-08-2024`) — LLM for question generation
- **Uvicorn** — ASGI server

## Project Structure

```
UPSC_Agents/
├── main.py           # FastAPI application
├── prompt.md         # System prompt for Cohere model
├── requirements.txt  # Python dependencies
└── README.md
```

## Setup

**1. Install dependencies**
```bash
python3 -m pip install -r requirements.txt
```

**2. Set Cohere API key**
```bash
export CO_API_KEY=<your_cohere_api_key>
```
Get your key at [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)

**3. Start the server**
```bash
python3 -m uvicorn main:app --reload
```

Server runs at `http://localhost:8000`

## API Endpoints

### GET `/next`
Generates a new UPSC Science MCQ question along with the correct answer.

```bash
curl http://localhost:8000/next
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
Submit your answer for the current question to check if it is correct.

**Single answer:**
```bash
curl -X POST http://localhost:8000/answer \
  -H "Content-Type: application/json" \
  -d '{"answer": "Option2"}'
```

**Multiple answers:**
```bash
curl -X POST http://localhost:8000/answer \
  -H "Content-Type: application/json" \
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

## Notes

- Always call `/next` before `/answer`
- Questions cover Physics, Chemistry, Biology, Environmental Science, Space Science, Biotechnology, and General Science
- Questions can have single or multiple correct answers


### how to generate prompt.md 

```
you are in UPSC exam expert.
I need your assent to get question for practicing exam of Science paper.
give me unique question when i type next with 5 options and correct answer in JSON format .
Question are multi choice question(MCQ).
JSON format sample is here: 
{
     "Ques":"Question description here" 
      "Option1": "",
      "Option2": "",
      "Option3": "",
      "Option4": "",
      "Option5": "",
      "Ans":"Option1,Option3,Option5"
}
```

``` next give below prompt in chatgpt

Generate the reverse prompt which i can use in programming and pass system prompt to LLM

then chatgpt generate prompt 


---

<img width="1212" height="1518" alt="image" src="https://github.com/user-attachments/assets/d6179bc2-9170-4740-b18a-a1932794f3fe" />


<img width="1212" height="1518" alt="image" src="https://github.com/user-attachments/assets/1a15f0a6-17c4-4512-a209-e6941c7c14fc" />




# Clean React Native cache
npx react-native start --reset-cache

# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Full clean (all of the above + node_modules)
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npx react-native run-ios