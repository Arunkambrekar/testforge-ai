from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.claude_service import get_claude_response
from prompts.edge_cases import get_edge_cases_prompt
import json, re

router = APIRouter()

class EdgeCaseRequest(BaseModel):
    feature_description: str
    feature_type: str = "Web Application"

@router.post("/generate")
async def generate_edge_cases(request: EdgeCaseRequest):
    try:
        if not request.feature_description.strip():
            raise HTTPException(status_code=400, detail="Feature description is required")

        prompt = get_edge_cases_prompt(
            feature_description=request.feature_description,
            feature_type=request.feature_type
        )

        raw = await get_claude_response(prompt)

        cleaned = re.sub(r"```json\s*", "", raw.strip())
        cleaned = re.sub(r"```\s*", "", cleaned).strip()
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            cleaned = cleaned[start:end+1]

        parsed = json.loads(cleaned)
        return {"success": True, "data": parsed}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")