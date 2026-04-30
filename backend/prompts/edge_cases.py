def get_edge_cases_prompt(feature_description: str, feature_type: str) -> str:
    return f"""You are a world-class QA Engineer with 15 years of experience finding edge cases that break production systems.

Analyze this feature and find ALL hidden edge cases most testers miss:

Feature: {feature_description}
Feature Type: {feature_type}

Return ONLY a valid JSON object in this exact format:

{{
  "feature_summary": "One line summary of the feature being tested",
  "coverage_score": 73,
  "risk_level": "High",
  "total_edge_cases": 18,
  "categories": [
    {{
      "name": "Input Validation",
      "icon": "⌨️",
      "risk": "Critical",
      "cases": [
        {{
          "id": "EC-001",
          "title": "Empty string submitted as username",
          "scenario": "User submits form with only whitespace in username field",
          "why_missed": "Testers usually test completely empty fields but miss whitespace-only inputs",
          "impact": "Could create accounts with blank usernames breaking display logic",
          "risk": "High",
          "test_hint": "Assert that trim().length === 0 is treated as empty"
        }}
      ]
    }}
  ],
  "missing_areas": [
    "Concurrent session handling",
    "Token expiry during active use",
    "Browser back button after logout"
  ],
  "top_risks": [
    {{
      "area": "Race Conditions",
      "description": "Double form submission on slow networks",
      "severity": "Critical"
    }}
  ]
}}

Categories to cover (include ALL that apply):
1. Input Validation — empty, null, special chars, max length, unicode, SQL injection patterns
2. Network & Connectivity — slow network, offline, timeout, retry behavior
3. Session & Auth — expired token, concurrent sessions, logout mid-flow
4. Data Boundaries — min/max values, zero, negative numbers, decimal precision
5. Concurrency — double submit, rapid clicks, multiple tabs
6. UI & Browser — mobile viewport, zoom, keyboard navigation, screen reader
7. Performance — large data sets, slow rendering, memory leaks
8. Security — XSS patterns, CSRF, unauthorized access, data exposure

Rules:
- coverage_score: integer 0-100 (be realistic, most features score 40-75)
- risk_level: "Low", "Medium", "High", or "Critical"
- risk per case: "Low", "Medium", "High", or "Critical"  
- why_missed: explain WHY testers usually miss this (very important)
- test_hint: give a concrete testing tip
- Generate 15-22 edge cases total across all categories
- missing_areas: list 4-6 areas that are commonly untested
- top_risks: list 3 highest risk items

Return ONLY the JSON. No explanation outside JSON."""