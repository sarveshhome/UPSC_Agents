---
description: Run the storedataindatabase strategy — update question_service.py so unlawful LLM phase issues are caught and persisted to the DB as intended
---

Run `storedataindatabase` instructions against the current branch. Treat `llm.py` as source of truth for exceptions and response payloads, then patch `question_service.py` so bad phase values never bypass it.

After updating, rerun the app smoke tests (`uvicorn main:app --reload` or the project run script) to verify.
