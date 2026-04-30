from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.claude_service import call_claude
from prompts.ai_explain import get_ai_explain_prompt
import json
import re

router = APIRouter()

class ExplainRequest(BaseModel):
    error_input: str

@router.post("/explain")
async def explain_error(request: ExplainRequest):
    # Fix 1 — Input validation
    if len(request.error_input.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Error input too short. Please paste a complete error message."
        )

    try:
        prompt = get_ai_explain_prompt(error_input=request.error_input)
        response_text = await call_claude(prompt)

        clean = response_text.strip()
        clean = re.sub(r'```json\s*', '', clean)
        clean = re.sub(r'```\s*', '', clean)
        start = clean.find('{')
        end = clean.rfind('}')
        if start != -1 and end != -1:
            clean = clean[start:end+1]

        result = json.loads(clean)
        return result

    except Exception:
        # Fix 2 — AI failure fallback
        return {
            "error_type": "Unknown",
            "root_cause": "Unable to analyze error automatically",
            "why_it_happened": "AI service failed or received invalid input",
            "impact": "Automated analysis not available for this error",
            "fix_suggestions": [
                "Check the error message manually",
                "Search the error on Stack Overflow",
                "Retry the request with a cleaner error message"
            ],
            "code_example": "",
            "prevention_tip": "Ensure you paste a complete and valid error message",
            "confidence": "Low"
        }