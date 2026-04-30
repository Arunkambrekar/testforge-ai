def get_prompt(endpoint: str, method: str, description: str, payload: str) -> str:
    return f"""You are a senior QA engineer. Generate API test cases.

Endpoint: {method} {endpoint}
Description: {description}
Sample Payload: {payload}

Return ONLY a valid JSON object. No markdown. No code blocks. No explanation.

{{
  "endpoint": "{method} {endpoint}",
  "summary": "Brief summary of what this endpoint does",
  "total_cases": 12,
  "test_cases": [
    {{
      "id": "API_001",
      "category": "positive",
      "title": "Valid request returns success",
      "description": "Test with valid input data",
      "priority": "critical",
      "request": {{
        "method": "{method}",
        "endpoint": "{endpoint}",
        "headers": {{"Content-Type": "application/json"}},
        "body": {{}}
      }},
      "expected_status": 200,
      "expected_response": "Returns success response",
      "validation_points": ["Status is 200", "Response body is valid"]
    }}
  ],
  "status_codes_to_test": [200, 400, 401, 403, 404, 500],
  "security_checks": [
    "SQL injection prevention",
    "XSS payload rejection",
    "Unauthorized access blocked"
  ],
  "sample_request": {{
    "method": "{method}",
    "endpoint": "{endpoint}",
    "headers": {{"Content-Type": "application/json"}},
    "body": {{}}
  }},
  "sample_response": {{
    "success": {{"status": 200, "body": {{"message": "Success"}}}},
    "error": {{"status": 400, "body": {{"message": "Bad request"}}}}
  }}
}}

Generate exactly 12 test cases:
- 3 positive cases (valid inputs, success scenarios)
- 4 negative cases (invalid inputs, error scenarios)
- 2 boundary cases (min/max values, edge inputs)
- 2 security cases (injection, unauthorized access)
- 1 performance case (response time check)

IMPORTANT: Return ONLY the JSON. Nothing else."""