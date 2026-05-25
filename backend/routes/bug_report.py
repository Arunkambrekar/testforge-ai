from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.llm_service import call_llm
from prompts.bug_report import get_bug_report_prompt
import json, re

router = APIRouter()

class BugReportRequest(BaseModel):
    raw_description: str
    app_type: str = "Web Application"
    severity: str = "Medium"
    provider: str = "groq"

@router.post("/generate")
async def generate_bug_report(request: BugReportRequest):
    try:
        if not request.raw_description.strip():
            raise HTTPException(status_code=400, detail="Bug description is required")

        if len(request.raw_description) < 10:
            raise HTTPException(status_code=400, detail="Please provide more details about the bug")

        prompt = get_bug_report_prompt(
            raw_description=request.raw_description,
            app_type=request.app_type,
            severity=request.severity
        )

        raw = await call_llm(prompt, provider=request.provider)

        cleaned = re.sub(r"```json\s*", "", raw.strip())
        cleaned = re.sub(r"```\s*", "", cleaned).strip()
        parsed = json.loads(cleaned)

        return {
            "success": True,
            "raw_description": request.raw_description,
            "app_type": request.app_type,
            "bug_report": parsed
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")