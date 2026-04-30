"use client";
import { useState } from "react";
import { generateTests } from "@/lib/api";
import ExportBar from "@/components/ExportBar";
import { exportTestCasesToPDF, exportToCSV } from "@/lib/export";

interface TestCase {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  steps: string[];
  expected_result: string;
  test_data?: string;
}

interface TestSuite {
  feature: string;
  summary: string;
  total_cases: number;
  test_cases: TestCase[];
  coverage_areas: string[];
  missing_coverage: string[];
}

const priorityColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low:      "bg-green-500/20 text-green-400 border-green-500/30",
};

const categoryColor: Record<string, string> = {
  happy_path: "bg-blue-500/20 text-blue-400",
  negative:   "bg-red-500/20 text-red-400",
  edge_case:  "bg-purple-500/20 text-purple-400",
  security:   "bg-yellow-500/20 text-yellow-400",
};

export default function GeneratorPage() {
  const [feature, setFeature] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<TestSuite | null>(null);
  const [error, setError]     = useState("");

  async function handleGenerate() {
    if (!feature.trim()) {
      setError("Please enter a feature description");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await generateTests(feature, context);
      // Handle both {data: {...}} and direct object response
      const parsed = response?.data ?? response;
      setResult(parsed);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    const text = (result.test_cases || [])
      .map(
        (tc) =>
          `${tc.id} | ${tc.title} | ${tc.priority.toUpperCase()}\n` +
          `Category: ${tc.category}\n` +
          `Steps:\n${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\n` +
          `Expected: ${tc.expected_result}` +
          (tc.test_data ? `\nTest Data: ${tc.test_data}` : "")
      )
      .join("\n\n─────────────────────────────\n\n");
    navigator.clipboard.writeText(text);
  }

  function handlePDF() {
    if (!result) return;
    exportTestCasesToPDF(
      (result.test_cases || []).map((tc) => ({
        tc_id:           tc.id,
        title:           tc.title,
        category:        tc.category,
        priority:        tc.priority,
        steps:           tc.steps,
        expected_result: tc.expected_result,
        test_data:       tc.test_data ?? "",
      })),
      result.feature,
      "testforge-test-cases"
    );
  }

  function handleCSV() {
    if (!result) return;
    exportToCSV(
      (result.test_cases || []).map((tc) => ({
        ID:              tc.id,
        Title:           tc.title,
        Category:        tc.category,
        Priority:        tc.priority,
        Steps:           tc.steps.join(" | "),
        Expected_Result: tc.expected_result,
        Test_Data:       tc.test_data ?? "",
      })),
      "testforge-test-cases"
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4
                      flex items-center gap-4">
        <a href="/"
          className="text-gray-400 hover:text-white
                     transition-colors text-sm">
          ← Back
        </a>
        <div>
          <h1 className="text-lg font-bold text-blue-400">
            🧪 Test Case Generator
          </h1>
          <p className="text-gray-500 text-xs">
            Describe a feature → Get structured test cases instantly
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Input Card */}
        <div className="bg-gray-900 border border-gray-800
                        rounded-xl p-6 mb-6">

          <h2 className="text-sm font-semibold text-gray-400
                         uppercase tracking-wider mb-5">
            Describe Your Feature
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Feature Description
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="e.g. Login page with email, password,
remember me checkbox and forgot password link"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700
                         rounded-lg px-4 py-3 text-white
                         placeholder-gray-600 focus:outline-none
                         focus:border-blue-500 resize-none
                         transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">
              Extra Context
              <span className="text-gray-600 ml-2">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. React app, REST API,
JWT auth, mobile responsive"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700
                         rounded-lg px-4 py-3 text-white
                         placeholder-gray-600 focus:outline-none
                         focus:border-blue-500 resize-none
                         transition-colors"
            />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10
                            border border-red-500/30 rounded-lg
                            text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500
                       disabled:bg-gray-800
                       disabled:cursor-not-allowed
                       disabled:text-gray-500
                       text-white font-semibold py-3 px-6
                       rounded-lg transition-all text-sm"
          >
            {loading
              ? "⏳ Generating test cases... (10–15 sec)"
              : "🧪 Generate Test Cases"
            }
          </button>
        </div>

        {/* Results */}
        {result && (
          <div>

            {/* Export Bar */}
            <div className="mb-5">
              <ExportBar
                itemCount={result.total_cases}
                label="test cases"
                onCopy={handleCopy}
                onDownloadPDF={handlePDF}
                onDownloadCSV={handleCSV}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-900 border border-blue-500/30
                            rounded-xl p-5 mb-5">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Feature</p>
                  <p className="text-white font-semibold">{result.feature}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Total Cases</p>
                  <p className="text-blue-400 font-bold text-2xl">
                    {result.total_cases}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-xs mb-1">Summary</p>
                  <p className="text-gray-300 text-sm">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Test Cases */}
            <div className="space-y-4 mb-6">
              {(result.test_cases || []).map((tc) => (
                <div
                  key={tc.id}
                  className="bg-gray-900 border border-gray-800
                             rounded-xl p-5 hover:border-gray-600
                             transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs
                                       font-mono bg-gray-800
                                       px-2 py-1 rounded">
                        {tc.id}
                      </span>
                      <span className={`text-xs px-2 py-1
                                       rounded font-medium
                                       ${categoryColor[tc.category]
                                         ?? "bg-gray-700 text-gray-300"
                                       }`}>
                        {tc.category.replace("_", " ")}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded
                                     border font-medium
                                     ${priorityColor[tc.priority]
                                       ?? "border-gray-700 text-gray-400"
                                     }`}>
                      {tc.priority}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold mb-1">
                    {tc.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">
                    {tc.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-gray-500 text-xs uppercase
                                  tracking-wider mb-2">
                      Steps
                    </p>
                    <div className="space-y-1">
                      {(tc.steps || []).map((step, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-gray-600 w-5 shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-gray-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-500/10 border
                                  border-green-500/20 rounded-lg
                                  px-4 py-3 mb-3">
                    <p className="text-gray-500 text-xs mb-1">
                      Expected Result
                    </p>
                    <p className="text-green-400 text-sm">
                      ✓ {tc.expected_result}
                    </p>
                  </div>

                  {tc.test_data && (
                    <div className="bg-gray-800 rounded-lg px-4 py-3">
                      <p className="text-gray-500 text-xs mb-1">
                        Test Data
                      </p>
                      <p className="text-gray-300 text-sm">
                        {tc.test_data}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Coverage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800
                              rounded-xl p-5">
                <p className="text-gray-500 text-xs uppercase
                               tracking-wider mb-3">
                  ✅ Coverage Areas
                </p>
                <ul className="space-y-2">
                  {(result.coverage_areas || []).map((area, i) => (
                    <li key={i}
                      className="text-gray-300 text-sm
                                 flex gap-2 items-start">
                      <span className="text-green-400 mt-0.5">•</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900 border border-gray-800
                              rounded-xl p-5">
                <p className="text-gray-500 text-xs uppercase
                               tracking-wider mb-3">
                  ⚠️ Missing Coverage
                </p>
                <ul className="space-y-2">
                  {(result.missing_coverage || []).map((gap, i) => (
                    <li key={i}
                      className="text-gray-300 text-sm
                                 flex gap-2 items-start">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}