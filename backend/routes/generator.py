from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.claude_service import get_claude_response
from prompts.test_generator import get_prompt
import json, re

router = APIRouter()

class FeatureInput(BaseModel):
    feature: str
    context: Optional[str] = ""

@router.post("/generate")
async def generate_tests(body: FeatureInput):
    try:
        if not body.feature.strip():
            raise HTTPException(status_code=400, detail="Feature description cannot be empty")

        prompt = get_prompt(body.feature, body.context)
        raw = await get_claude_response(prompt)

        cleaned = re.sub(r"```json\s*", "", raw.strip())
        cleaned = re.sub(r"```\s*", "", cleaned).strip()
        parsed = json.loads(cleaned)

        return {"success": True, "data": parsed}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")