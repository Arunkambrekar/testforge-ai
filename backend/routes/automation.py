from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.claude_service import call_claude
from prompts.automation import get_automation_prompt
import json
import re

router = APIRouter()

class AutomationRequest(BaseModel):
    flow_description: str
    base_url: str = "https://example.com"
    framework: str = "Playwright + PyTest"

@router.post("/generate")
async def generate_automation_script(request: AutomationRequest):
    try:
        if not request.flow_description.strip():
            raise HTTPException(status_code=400, detail="Flow description is required")

        prompt = get_automation_prompt(
            flow_description=request.flow_description,
            base_url=request.base_url,
            framework=request.framework
        )

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

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))