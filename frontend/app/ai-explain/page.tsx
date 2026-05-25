"use client";

import { useState, useEffect } from "react";
import { explainError } from "@/lib/api";

interface ExplainResult {
  error_type: string;
  root_cause: string;
  why_it_happened: string;
  impact: string;
  fix_suggestions: string[];
  code_example: string;
  prevention_tip: string;
  confidence: string;
}

const providerLabel: Record<string, string> = {
  groq: "⚡ Groq",
  openai: "OpenAI",
  claude: "Claude",
};

export default function AIExplainPage() {
  const [errorInput, setErrorInput] = useState("");
  const [provider, setProvider] = useState("groq");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ai_provider");
    if (saved) setProvider(saved);
  }, []);

  const handleExplain = async () => {
    if (!errorInput.trim()) {
      setError("Please paste an error to explain.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await explainError({ error_input: errorInput, provider } as any);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white text-sm">← Back</a>
            <h1 className="text-2xl font-bold">🤖 AI Error Explainer</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Using:</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
              {providerLabel[provider] ?? provider}
            </span>
            <a href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">Change →</a>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <textarea
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            placeholder="Paste your error (console, stack trace, API response)..."
            className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500/60 resize-none font-mono"
          />
          <button
            onClick={handleExplain}
            disabled={loading}
            className="mt-4 w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg font-medium transition"
          >
            {loading ? "Analyzing..." : "Explain Error"}
          </button>
          {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
        </div>

        {/* Output */}
        {result && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400 font-semibold mb-1">Root Cause</p>
              <p className="text-sm">{result.root_cause}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-400 font-semibold mb-1">Why It Happened</p>
              <p className="text-sm">{result.why_it_happened}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-400 font-semibold mb-1">Fix Suggestions</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {result.fix_suggestions.map((fix, i) => <li key={i}>{fix}</li>)}
              </ul>
            </div>
            {result.code_example && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-blue-400 font-semibold mb-2">Code Example</p>
                <pre className="text-xs text-green-400 whitespace-pre-wrap">{result.code_example}</pre>
              </div>
            )}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400 font-semibold mb-1">Prevention Tip</p>
              <p className="text-sm">{result.prevention_tip}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}