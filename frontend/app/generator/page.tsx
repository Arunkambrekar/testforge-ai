"use client";

import { useState, useEffect } from "react";
import { generateTests } from "@/lib/api";
import ExportBar from "@/components/ExportBar";

export default function GeneratorPage() {
  const [feature, setFeature] = useState("");
  const [context, setContext] = useState("");
  const [provider, setProvider] = useState("groq");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ai_provider");
    if (saved) setProvider(saved);
  }, []);

  const handleGenerate = async () => {
    if (!feature.trim()) {
      setError("Please enter a feature description");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await generateTests({ feature, context, provider });
      setResult(res.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  const handleDownloadCSV = () => {
    if (!result?.test_cases) return;
    const headers = ["ID", "Category", "Priority", "Title", "Description", "Steps", "Expected Result", "Test Data"];
    const rows = result.test_cases.map((tc: any) => [
      tc.id || "",
      tc.category || "",
      tc.priority || "",
      tc.title || "",
      tc.description || "",
      Array.isArray(tc.steps) ? tc.steps.join(" → ") : tc.steps || "",
      tc.expected_result || "",
      tc.test_data || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `test-cases-${feature.slice(0, 20).replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => window.print();

  const priorityColor: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const categoryColor: Record<string, string> = {
    happy_path: "bg-blue-500/20 text-blue-400",
    negative: "bg-red-500/20 text-red-400",
    edge_case: "bg-purple-500/20 text-purple-400",
    security: "bg-yellow-500/20 text-yellow-400",
    ui_ux: "bg-pink-500/20 text-pink-400",
  };

  const providerLabel: Record<string, string> = {
    groq: "⚡ Groq",
    openai: "OpenAI",
    claude: "Claude",
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white text-sm">← Back</a>
            <h1 className="text-2xl font-bold">🧪 Test Case Generator</h1>
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

          {/* Feature Input */}
          <label className="block text-xs text-gray-400 mb-1">Feature Description *</label>
          <textarea
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            placeholder="Enter feature description..."
            className="w-full h-28 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm mb-3"
          />

          {/* Context Input */}
          <label className="block text-xs text-gray-400 mb-1">Optional Context</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Optional context..."
            className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm"
          />

          {/* Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg font-medium transition"
          >
            {loading ? "Generating..." : "Generate Test Cases"}
          </button>

          {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
        </div>

        {/* Output */}
        {result && (
          <div className="space-y-4">
            <ExportBar
              onCopy={handleCopy}
              onDownloadPDF={handleDownloadPDF}
              onDownloadCSV={handleDownloadCSV}
              itemCount={result.test_cases?.length}
              label="test cases"
            />

            {result.summary && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-sm text-gray-300">
                📋 <span className="text-white font-medium">Summary:</span> {result.summary}
              </div>
            )}

            {result.test_cases && (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">ID</th>
                      <th className="px-4 py-3 whitespace-nowrap">Category</th>
                      <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Steps</th>
                      <th className="px-4 py-3 whitespace-nowrap">Expected Result</th>
                      <th className="px-4 py-3 whitespace-nowrap">Test Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {result.test_cases.map((tc: any, index: number) => (
                      <tr key={index} className="bg-gray-900 hover:bg-gray-800 transition">
                        <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{tc.id}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${categoryColor[tc.category] || "bg-gray-700 text-gray-300"}`}>
                            {tc.category?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full border ${priorityColor[tc.priority] || "bg-gray-700 text-gray-300"}`}>
                            {tc.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-white min-w-40">{tc.title}</td>
                        <td className="px-4 py-3 text-gray-300 min-w-45">{tc.description}</td>
                        <td className="px-4 py-3 text-gray-300 min-w-50">
                          <ol className="list-decimal list-inside space-y-1">
                            {Array.isArray(tc.steps)
                              ? tc.steps.map((step: string, i: number) => <li key={i} className="text-xs">{step}</li>)
                              : <li className="text-xs">{tc.steps}</li>
                            }
                          </ol>
                        </td>
                        <td className="px-4 py-3 text-gray-300 min-w-40">{tc.expected_result}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400 min-w-35">{tc.test_data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.coverage_areas && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Coverage Areas</p>
                <div className="flex flex-wrap gap-2">
                  {result.coverage_areas.map((area: string, i: number) => (
                    <span key={i} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}