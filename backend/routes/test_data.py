from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_service import call_llm
from prompts.test_data import get_test_data_prompt
import json, re

router = APIRouter()

class TestDataRequest(BaseModel):
    field_description: str
    data_type: str = "Text"
    constraints: str = ""
    provider: str = "groq"

@router.post("/generate")
async def generate_test_data(request: TestDataRequest):
    try:
        if not request.field_description.strip():
            raise HTTPException(status_code=400, detail="Field description is required")

        prompt = get_test_data_prompt(
            field_description=request.field_description,
            data_type=request.data_type,
            constraints=request.constraints
        )

        raw = await call_llm(prompt, provider=request.provider)

        cleaned = re.sub(r"```json\s*", "", raw.strip())
        cleaned = re.sub(r"```\s*", "", cleaned).strip()
        parsed = json.loads(cleaned)

        return {
            "success": True,
            "field_description": request.field_description,
            "data_type": request.data_type,
            "result": parsed
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse response. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")