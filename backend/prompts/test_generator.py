def get_prompt(feature: str, context: str) -> str:
    return f"""
Generate a complete test suite for this feature.
Feature: {feature}
Extra Context: {context}
Return ONLY this exact JSON structure:
{{
  "feature": "{feature}",
  "summary": "One line summary of what was analyzed",
  "total_cases": 0,
  "test_cases": [
    {{
      "id": "TC_001",
      "category": "happy_path",
      "title": "Test title here",
      "description": "What this test verifies",
      "priority": "critical",
      "steps": [
        "Step 1: ...",
        "Step 2: ...",
        "Step 3: ..."
      ],
      "expected_result": "What should happen",
      "test_data": "Any specific data needed"
    }}
  ],
  "coverage_areas": ["area1", "area2"],
  "missing_coverage": ["gap1", "gap2"]
}}
Category must be one of:
happy_path, negative, edge_case, security, ui_ux

Priority must be one of:
critical, high, medium, low

UI/UX test cases should cover:
- Button states (disabled, loading, hover)
- Error message visibility and clarity
- Form validation feedback
- Responsive layout behavior
- Accessibility (keyboard navigation, screen reader labels)
- Loading indicators and empty states
- Color contrast and readability

Generate minimum 18 test cases.
Cover all 5 categories including at least 3 ui_ux test cases.
Make total_cases match actual count.
"""