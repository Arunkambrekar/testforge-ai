const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Test Case Generator ───────────────────────────────────────
export async function generateTests(data: {
  feature: string;
  context?: string;
  provider: string;
}) {
  const response = await fetch(`${BASE_URL}/api/generator/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      feature: data.feature,
      context: data.context || "",
      provider: data.provider, // ✅ REQUIRED
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate tests");
  }

  return response.json();
}


// ─── API Test Generator ────────────────────────────────────────
export async function generateApiTests(data: {
  method: string;
  endpoint: string;
  description: string;
  payload?: string;
}) {
  const response = await fetch(`${BASE_URL}/api/api-tests/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate API tests");
  }

  return response.json();
}


// ─── Automation Script Generator ──────────────────────────────
export async function generateAutomationScript(
  flowDescription: string,
  baseUrl: string,
  framework: string
) {
  const response = await fetch(`${BASE_URL}/api/automation/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      flow_description: flowDescription,
      base_url: baseUrl,
      framework: framework,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate automation script");
  }

  return response.json();
}


// ─── Bug Report Generator ─────────────────────────────────────
export async function generateBugReport(
  rawDescription: string,
  appType: string,
  severity: string
) {
  const response = await fetch(`${BASE_URL}/api/bug-report/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      raw_description: rawDescription,
      app_type: appType,
      severity: severity,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate bug report");
  }

  return response.json();
}


// ─── Edge Case Suggester ───────────────────────────────────────
export async function generateEdgeCases(data: {
  feature_description: string;
  feature_type: string;
}) {
  const response = await fetch(`${BASE_URL}/api/edge-cases/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate edge cases");
  }

  return response.json();
}


// ─── Test Data Generator ───────────────────────────────────────
export async function generateTestData(data: {
  field_description: string;
  data_type: string;
  constraints: string;
}) {
  const response = await fetch(`${BASE_URL}/api/test-data/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate test data");
  }

  return response.json();
}


// ─── AI Error Explainer ───────────────────────────────────────
export async function explainError(data: {
  error_input: string;
  provider: string;
}) {
  const response = await fetch(`${BASE_URL}/api/ai-explain/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error_input: data.error_input,
      provider: data.provider, // ✅ REQUIRED
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to explain error");
  }

  return response.json();
}