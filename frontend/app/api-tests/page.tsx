"use client";
import { useState, useEffect } from "react";
import { generateApiTests } from "@/lib/api";

const priorityColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const categoryColor: Record<string, string> = {
  positive: "bg-green-500/20 text-green-400",
  negative: "bg-red-500/20 text-red-400",
  boundary: "bg-purple-500/20 text-purple-400",
  security: "bg-yellow-500/20 text-yellow-400",
  performance: "bg-blue-500/20 text-blue-400",
};

const statusColor = (status: number) => {
  if (status >= 200 && status < 300) return "text-green-400";
  if (status >= 400 && status < 500) return "text-yellow-400";
  return "text-red-400";
};

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function safeJson(val: unknown): string {
  try { return JSON.stringify(val, null, 2); }
  catch { return "Invalid JSON"; }
}

const providerLabel: Record<string, string> = {
  groq: "⚡ Groq",
  openai: "OpenAI",
  claude: "Claude",
};

export default function APITestsPage() {
  const [endpoint, setEndpoint]       = useState("");
  const [method, setMethod]           = useState("POST");
  const [description, setDescription] = useState("");
  const [payload, setPayload]         = useState("");
  const [provider, setProvider]       = useState("groq");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<Record<string, unknown> | null>(null);
  const [error, setError]             = useState("");
  const [showSample, setShowSample]   = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai_provider");
    if (saved) setProvider(saved);
  }, []);

  async function handleGenerate() {
    if (!endpoint.trim()) {
      setError("Please enter an endpoint");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await generateApiTests({ method, endpoint, description, payload });
      const parsed = data?.data ?? data;
      setResult(parsed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const testCases = (result?.test_cases as Record<string, unknown>[] | undefined) ?? [];
  const statusCodes = (result?.status_codes_to_test as number[] | undefined) ?? [];
  const securityChecks = (result?.security_checks as string[] | undefined) ?? [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-white text-sm">← Back</a>
          <div>
            <h1 className="text-lg font-bold text-blue-400">🌐 API Test Generator</h1>
            <p className="text-gray-500 text-xs">Enter endpoint → Get positive, negative and security tests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Using:</span>
          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
            {providerLabel[provider] ?? provider}
          </span>
          <a href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">Change →</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Input Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Method *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Endpoint *</label>
              <input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="e.g. /api/login"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Login with email and password, returns JWT token"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">Sample Request Body (optional)</label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder={'{\n  "email": "user@test.com",\n  "password": "123456"\n}'}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
            />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating API tests...
              </span>
            ) : "🌐 Generate API Tests"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="flex flex-wrap gap-8 mb-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Endpoint</p>
                  <p className="text-white font-mono font-semibold">{safeStr(result.endpoint)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Total Cases</p>
                  <p className="text-blue-400 font-bold text-2xl">{safeStr(result.total_cases)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-xs mb-1">Summary</p>
                  <p className="text-gray-300 text-sm">{safeStr(result.summary)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-500 text-xs self-center">Status codes:</span>
                {statusCodes.map((code) => (
                  <span key={code} className={`text-xs font-mono px-2 py-1 bg-gray-800 rounded font-semibold ${statusColor(code)}`}>
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSample(!showSample)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5 text-left hover:border-gray-600 transition-all"
            >
              <span className="text-gray-400 text-sm font-medium">
                {showSample ? "▼" : "▶"} Sample Request / Response
              </span>
            </button>

            {showSample && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Sample Request</p>
                  <pre className="text-green-400 text-xs overflow-auto">{safeJson(result.sample_request)}</pre>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Sample Response</p>
                  <pre className="text-blue-400 text-xs overflow-auto">{safeJson(result.sample_response)}</pre>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {testCases.map((tc) => {
                const reqBody = (() => {
                  if (!tc.request || typeof tc.request !== "object") return null;
                  const body = (tc.request as Record<string, unknown>).body;
                  if (!body || typeof body !== "object") return null;
                  const keys = Object.keys(body as Record<string, unknown>);
                  if (keys.length === 0) return null;
                  return body as Record<string, unknown>;
                })();
                const validationPoints = (tc.validation_points as string[] | undefined) ?? [];

                return (
                  <div key={safeStr(tc.id)} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm font-mono">{safeStr(tc.id)}</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${categoryColor[safeStr(tc.category)] || "bg-gray-700 text-gray-300"}`}>
                          {safeStr(tc.category)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold font-mono ${statusColor(Number(tc.expected_status))}`}>
                          {safeStr(tc.expected_status)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border font-medium ${priorityColor[safeStr(tc.priority)] || "bg-gray-700 text-gray-300"}`}>
                          {safeStr(tc.priority)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{safeStr(tc.title)}</h3>
                    <p className="text-gray-400 text-sm mb-4">{safeStr(tc.description)}</p>
                    {reqBody && (
                      <div className="bg-gray-800 rounded-lg px-4 py-3 mb-3">
                        <p className="text-gray-500 text-xs mb-2">Request Body</p>
                        <pre className="text-yellow-400 text-xs overflow-auto">{safeJson(reqBody)}</pre>
                      </div>
                    )}
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-3">
                      <p className="text-gray-500 text-xs mb-1">Expected Response</p>
                      <p className="text-green-400 text-sm">{safeStr(tc.expected_response)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Validation Points</p>
                      <ul className="space-y-1">
                        {validationPoints.map((point, i) => (
                          <li key={i} className="text-gray-300 text-sm flex gap-2">
                            <span className="text-blue-400">✓</span>{point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-5">
              <p className="text-yellow-400 text-xs uppercase tracking-wider mb-3">🔒 Security Checks To Perform</p>
              <ul className="space-y-2">
                {securityChecks.map((check, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-yellow-400">⚠</span>{check}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}