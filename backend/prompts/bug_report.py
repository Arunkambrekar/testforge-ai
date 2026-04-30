def get_bug_report_prompt(raw_description: str, app_type: str, severity: str) -> str:
    return f"""You are a senior QA engineer who writes professional, detailed bug reports for Jira.

The tester reported this bug (raw, messy description):
\"\"\"{raw_description}\"\"\"

App Type: {app_type}
Initial Severity Assessment: {severity}

Transform this into a professional, structured bug report.

Return ONLY a valid JSON object with exactly this structure:
{{
  "title": "Clear, concise bug title starting with a verb (e.g., Login button does not respond on mobile Safari)",
  "severity": "Critical | High | Medium | Low",
  "priority": "P1 | P2 | P3 | P4",
  "status": "New",
  "environment": {{
    "os": "Inferred OS or 'Not specified'",
    "browser": "Inferred browser or 'Not specified'",
    "app_version": "Inferred version or 'Not specified'",
    "device": "Inferred device or 'Not specified'"
  }},
  "steps_to_reproduce": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "expected_result": "What should happen",
  "actual_result": "What actually happens",
  "impact": "Who is affected and how badly",
  "possible_cause": "Technical guess at root cause",
  "suggested_fix": "Concrete suggestion to fix this",
  "test_data_used": "Any credentials, inputs, or data mentioned",
  "labels": ["label1", "label2", "label3"],
  "attachments_needed": ["screenshot of error", "console logs"],
  "reproducibility": "Always | Sometimes | Rarely | Could not reproduce"
}}

Rules:
- Return ONLY the JSON — no explanation, no markdown, no backticks
- Make steps_to_reproduce detailed and numbered
- Labels should be relevant tags like: login, mobile, regression, ui, api, performance
- Severity and Priority must be consistent with each other
- Be specific — never use vague language"""