from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.llm_service import call_llm
import json
import re
from prompts.api_test import get_prompt

router = APIRouter()

class APIInput(BaseModel):
    endpoint: str
    method: str
    description: Optional[str] = ""
    payload: Optional[str] = ""
    provider: str = "groq"  # ← changed from "openai"

@router.post("/generate")
async def generate_api_tests(body: APIInput):
    try:
        if not body.endpoint.strip():
            raise HTTPException(status_code=400, detail="Endpoint cannot be empty")

        prompt = get_prompt(
            body.endpoint,
            body.method.upper(),
            body.description or "",
            body.payload or ""
        )

        raw = await call_llm(prompt, provider=body.provider)

        # Clean response
        clean = raw.strip()
        clean = re.sub(r'```json\s*', '', clean)
        clean = re.sub(r'```\s*', '', clean)
        start = clean.find('{')
        end = clean.rfind('}')
        if start != -1 and end != -1:
            clean = clean[start:end+1]

        parsed = json.loads(clean)
        return {"success": True, "data": parsed}

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")