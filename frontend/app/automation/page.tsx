"use client";
import { useState, useEffect } from "react";
import { generateAutomationScript } from "@/lib/api";

interface ScriptFile {
  filename: string;
  type: string;
  description: string;
  code: string;
}

interface AutomationResult {
  feature: string;
  framework: string;
  pattern: string;
  files: ScriptFile[];
  dependencies: string[];
  install_command: string;
  run_command: string;
  notes: string;
}

const providerLabel: Record<string, string> = {
  groq: "⚡ Groq",
  openai: "OpenAI",
  claude: "Claude",
};

export default function AutomationPage() {
  const [feature, setFeature] = useState("");
  const [flowSteps, setFlowSteps] = useState("");
  const [provider, setProvider] = useState("groq");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [error, setError] = useState("");
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ai_provider");
    if (saved) setProvider(saved);
  }, []);

  async function handleGenerate() {
    if (!feature.trim()) {
      setError("Please enter a feature or flow description");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await generateAutomationScript(feature, flowSteps, "Playwright + PyTest");
      setResult(data.data);
      setActiveFile(0);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyCode(code: string, index: number) {
    navigator.clipboard.writeText(code);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadFile(filename: string, code: string) {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.split("/").pop() || filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAll() {
    if (!result) return;
    result.files.forEach((file) => {
      setTimeout(() => downloadFile(file.filename, file.code), 100);
    });
  }

  const fileTypeColor: Record<string, string> = {
    page_object: "bg-blue-500/20 text-blue-400",
    test_file: "bg-green-500/20 text-green-400",
    config: "bg-purple-500/20 text-purple-400",
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-white text-sm">← Back</a>
          <div>
            <h1 className="text-lg font-bold text-blue-400">🤖 Automation Script Generator</h1>
            <p className="text-gray-500 text-xs">Describe a flow → Get ready Playwright + PyTest code</p>
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

        {/* Input */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Feature / Flow Description *</label>
            <textarea
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="e.g. Login flow with email and password, remember me checkbox"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">Step by Step Flow (optional)</label>
            <textarea
              value={flowSteps}
              onChange={(e) => setFlowSteps(e.target.value)}
              placeholder="e.g. 1. Navigate to /login  2. Enter email  3. Enter password  4. Click login  5. Verify dashboard loads"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            {loading ? "⏳ Generating automation scripts..." : "🤖 Generate Automation Scripts"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div>
            {/* Summary Bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Framework</p>
                    <p className="text-blue-400 font-semibold">{result.framework}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Pattern</p>
                    <p className="text-white font-semibold">{result.pattern}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Files Generated</p>
                    <p className="text-green-400 font-bold text-xl">{result.files.length}</p>
                  </div>
                </div>
                <button
                  onClick={downloadAll}
                  className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  ⬇️ Download All Files
                </button>
              </div>
            </div>

            {/* Install + Run Commands */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Install Command</p>
                <code className="text-yellow-400 text-sm break-all">{result.install_command}</code>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Run Command</p>
                <code className="text-green-400 text-sm">{result.run_command}</code>
              </div>
            </div>

            {/* File Tabs */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-5">
              <div className="flex border-b border-gray-800">
                {result.files.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFile(index)}
                    className={`px-4 py-3 text-sm font-medium transition-all flex-1 text-left ${
                      activeFile === index
                        ? "bg-gray-800 text-white border-b-2 border-blue-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className={`text-xs px-2 py-0.5 rounded mr-2 font-medium ${fileTypeColor[file.type] || "bg-gray-700 text-gray-300"}`}>
                      {file.type.replace("_", " ")}
                    </span>
                    {file.filename.split("/").pop()}
                  </button>
                ))}
              </div>

              {result.files[activeFile] && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-mono text-sm">{result.files[activeFile].filename}</p>
                      <p className="text-gray-500 text-xs mt-1">{result.files[activeFile].description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyCode(result.files[activeFile].code, activeFile)}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-all"
                      >
                        {copied === activeFile ? "✅ Copied!" : "📋 Copy"}
                      </button>
                      <button
                        onClick={() => downloadFile(result.files[activeFile].filename, result.files[activeFile].code)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg transition-all"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                  <pre className="bg-gray-950 rounded-lg p-4 overflow-auto text-sm text-gray-300 max-h-96 font-mono leading-relaxed">
                    {result.files[activeFile].code}
                  </pre>
                </div>
              )}
            </div>

            {result.notes && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">
                <p className="text-yellow-400 text-xs uppercase tracking-wider mb-2">📝 Notes</p>
                <p className="text-gray-300 text-sm">{result.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}