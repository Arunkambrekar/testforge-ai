def get_ai_explain_prompt(error_input: str) -> str:
    return f"""You are a senior QA engineer and debugging expert.

A developer/tester has encountered this error:

{error_input}

Analyze this error and return ONLY a valid JSON object:

{{
  "error_type": "One of: Console Error / Stack Trace / API Error / Network Error / Selenium Error / Playwright Error / Unknown",
  "root_cause": "What exactly failed — be specific and technical",
  "why_it_happened": "The reason this error occurred — explain clearly",
  "impact": "What breaks because of this error",
  "fix_suggestions": [
    "Step 1 — specific actionable fix",
    "Step 2 — specific actionable fix",
    "Step 3 — specific actionable fix"
  ],
  "code_example": "Optional: short code snippet showing the fix (or empty string if not applicable)",
  "prevention_tip": "How to prevent this in future",
  "confidence": "High / Medium / Low"
}}

Rules:
- root_cause must be specific, not generic
- fix_suggestions must be actionable steps, not vague advice
- code_example should be real code if possible
- Return ONLY JSON. No markdown. No explanation outside JSON."""