def get_test_data_prompt(field_description: str, data_type: str, constraints: str) -> str:
    return f"""You are a senior QA engineer who specializes in test data generation.

The user wants test data for this field/form:
Field/Form Description: \"\"\"{field_description}\"\"\"
Data Type: {data_type}
Constraints/Rules: \"\"\"{constraints}\"\"\"

Generate comprehensive test data covering all categories.

Return ONLY a valid JSON object with exactly this structure:
{{
  "field_name": "Name of the field or form being tested",
  "summary": "One line summary of what was generated",
  "total_records": 25,
  "categories": [
    {{
      "name": "Valid Data",
      "description": "Data that should be accepted",
      "color": "green",
      "data": [
        {{
          "value": "actual test value here",
          "description": "why this is a valid test case",
          "expected_behavior": "should be accepted"
        }}
      ]
    }},
    {{
      "name": "Invalid Data",
      "description": "Data that should be rejected",
      "color": "red",
      "data": [
        {{
          "value": "actual test value here",
          "description": "why this should be rejected",
          "expected_behavior": "should show error message"
        }}
      ]
    }},
    {{
      "name": "Boundary Values",
      "description": "Min, max, and edge values",
      "color": "yellow",
      "data": [
        {{
          "value": "actual boundary value",
          "description": "boundary condition being tested",
          "expected_behavior": "accepted or rejected based on rule"
        }}
      ]
    }},
    {{
      "name": "Special Characters",
      "description": "Special chars, unicode, emojis",
      "color": "purple",
      "data": [
        {{
          "value": "actual special char value",
          "description": "what special character pattern this tests",
          "expected_behavior": "should be handled gracefully"
        }}
      ]
    }},
    {{
      "name": "Security Payloads",
      "description": "SQL injection, XSS, script injection",
      "color": "orange",
      "data": [
        {{
          "value": "actual security payload",
          "description": "type of attack being tested",
          "expected_behavior": "should be sanitized or rejected"
        }}
      ]
    }}
  ]
}}

Rules:
- Return ONLY JSON — no markdown, no backticks, no explanation
- Each category must have at least 4-6 data entries
- Values must be REAL, USABLE test data — not descriptions
- Security payloads must be real SQL injection and XSS strings
- Boundary values must use actual numbers from constraints
- Make data specific to the field type described"""