import anthropic
import os
import re
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

SYSTEM_PROMPT = """
You are TestForgeAI — a senior QA engineer.
Always return ONLY valid JSON.
No markdown. No code blocks. No explanation.
No text before or after the JSON.
Keep responses concise and well-structured.
"""

async def call_claude(user_prompt: str) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": user_prompt}
        ]
    )
    return message.content[0].text

# Alias for backward compatibility
async def get_claude_response(user_prompt: str) -> str:
    return await call_claude(user_prompt)