from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.llm_service import call_llm
from prompts.test_generator import get_prompt
import json
import re

router = APIRouter()

# ✅ Request model with provider support
class FeatureInput(BaseModel):
    feature: str
    context: Optional[str] = ""
    provider: str = "groq"  # default provider

@router.post("/generate")
async def generate_tests(body: FeatureInput):
    try:
        # ✅ Input validation
        if not body.feature.strip():
            raise HTTPException(
                status_code=400,
                detail="Feature description cannot be empty"
            )

        # ✅ Validate provider
        if body.provider not in ["openai", "claude", "groq"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid provider. Use 'openai', 'claude', or 'groq'."
            )

        # 🔧 Build prompt
        prompt = get_prompt(body.feature, body.context)

        # 🔥 Call LLM
        raw = await call_llm(prompt, provider=body.provider)

        # 🐛 Debug — check backend terminal
        print("RAW RESPONSE:", raw)

        # 🧹 Clean response
        cleaned = raw.strip()
        cleaned = re.sub(r"```json\s*", "", cleaned)
        cleaned = re.sub(r"```\s*", "", cleaned)

        # Extract JSON safely
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            cleaned = cleaned[start:end + 1]

        parsed = json.loads(cleaned)

        return {
            "success": True,
            "data": parsed
        }

    except json.JSONDecodeError as e:
        print("JSON PARSE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to parse AI response. Try again or adjust input."
        )

    except HTTPException:
        raise

    except Exception as e:
        import traceback
        traceback.print_exc()  # ✅ prints full error to terminal
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )