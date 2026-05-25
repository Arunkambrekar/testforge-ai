import os
from openai import AsyncOpenAI
import anthropic

async def call_llm(prompt: str, provider: str = "openai") -> str:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    # 🔹 OpenAI
    if provider == "openai":
        if not OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior QA engineer. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=800
        )
        return response.choices[0].message.content

    # 🔹 Claude
    elif provider == "claude":
        if not ANTHROPIC_API_KEY:
            raise ValueError("Anthropic API key not configured")
        client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
        response = await client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

    # 🔹 Groq (free!)
    elif provider == "groq":
        if not GROQ_API_KEY:
            raise ValueError("Groq API key not configured")
        client = AsyncOpenAI(
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a senior QA engineer. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=4096
        )
        return response.choices[0].message.content

    else:
        raise ValueError("Invalid provider. Use 'openai', 'claude', or 'groq'")