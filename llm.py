import json
import os
import logging
from pathlib import Path
import cohere
from cohere.types.response_format_v2 import JsonObjectResponseFormatV2
import cohere.errors

PROMPT = Path("prompt.md").read_text()
MODEL = os.getenv("COHERE_MODEL", "command-r-08-2024")
logger = logging.getLogger(__name__)

api_key = os.getenv("COHERE_API_KEY")
if not api_key or api_key.strip() in ("your_api_key_here", "REPLACE_ME", ""):
    raise ValueError("COHERE_API_KEY environment variable not set. Set it in .env or export before running.")

client = cohere.ClientV2(api_key)


def ask_llm(user_message: str) -> dict:
    try:
        response = client.chat(
            model=MODEL,
            messages=[
                {"role": "system", "content": PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format=JsonObjectResponseFormatV2(type="json_object"),
        )
        content = response.message.content
        text = content if isinstance(content, str) else content[0].text
        return json.loads(text)
    except (cohere.errors.ApiError, ConnectionError) as e:
        logger.error(f"Cohere API error: {e}")
        raise ValueError(f"LLM generation failed: {str(e)}") from e
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON response from LLM: {e}")
        raise ValueError(f"LLM returned invalid response: {str(e)}") from e
    except Exception as e:
        logger.error(f"Unexpected error calling LLM: {e}", exc_info=True)
        raise ValueError(f"LLM service unavailable: {str(e)}") from e