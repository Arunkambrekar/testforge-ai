def get_automation_prompt(flow_description: str, base_url: str, framework: str) -> str:
    return f"""You are an expert QA Automation Engineer specializing in Playwright with Python and the Page Object Model pattern.

Generate a complete, production-ready automation test suite for the following user flow:

Flow Description: {flow_description}
Base URL: {base_url}
Framework: {framework}

Generate exactly 3 files in this exact JSON format:

{{
  "flow_summary": "One line summary of what is being tested",
  "files": [
    {{
      "filename": "pages/login_page.py",
      "type": "page_object",
      "description": "Page Object class for this feature",
      "code": "# complete Python code here"
    }},
    {{
      "filename": "tests/test_login_flow.py",
      "type": "test_file",
      "description": "Pytest test file with all test cases",
      "code": "# complete Python code here"
    }},
    {{
      "filename": "conftest.py",
      "type": "conftest",
      "description": "Pytest fixtures and browser setup",
      "code": "# complete Python code here"
    }}
  ],
  "setup_instructions": [
    "pip install playwright pytest pytest-playwright",
    "playwright install chromium",
    "pytest tests/ -v --headed"
  ],
  "test_count": 5
}}

Rules:
1. Page Object file must have a class with __init__(self, page) and methods for every action
2. Test file must import the page object, use fixtures from conftest, have 4-6 test functions with docstrings
3. Conftest must have browser fixture, page fixture, and base_url fixture
4. All locators must use best practice selectors (role, label, placeholder)
5. Add proper assertions using Playwright expect()
6. Add comments explaining each section
7. Use the base URL: {base_url}

Return ONLY the JSON object. No explanation outside JSON."""