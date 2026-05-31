import json
import os
from pathlib import Path
import cohere
from cohere.types.response_format_v2 import JsonObjectResponseFormatV2

PROMPT = Path("prompt.md").read_text()
MODEL = os.getenv("COHERE_MODEL", "command-r-08-2024")

api_key = os.getenv("COHERE_API_KEY")
if not api_key:
    raise ValueError("COHERE_API_KEY environment variable not set")

client = cohere.ClientV2(api_key)


def ask_llm(user_message: str) -> dict:
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