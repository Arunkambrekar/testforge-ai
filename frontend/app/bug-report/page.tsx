"use client";

import { useState, useEffect } from "react";
import { generateBugReport } from "@/lib/api";
import Link from "next/link";

interface Environment {
  os: string;
  browser: string;
  app_version: string;
  device: string;
}

interface BugReport {
  title: string;
  severity: string;
  priority: string;
  status: string;
  environment: Environment;
  steps_to_reproduce: string[];
  expected_result: string;
  actual_result: string;
  impact: string;
  possible_cause: string;
  suggested_fix: string;
  test_data_used: string;
  labels: string[];
  attachments_needed: string[];
  reproducibility: string;
}

interface BugReportResult {
  success: boolean;
  raw_description: string;
  app_type: string;
  bug_report: BugReport;
}

const providerLabel: Record<string, string> = {
  groq: "⚡ Groq",
  openai: "OpenAI",
  claude: "Claude",
};

export default function BugReportPage() {
  const [rawDescription, setRawDescription] = useState("");
  const [appType, setAppType] = useState("Web Application");
  const [severity, setSeverity] = useState("Medium");
  const [provider, setProvider] = useState("groq");
  const [result, setResult] = useState<BugReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai_provider");
    if (saved) setProvider(saved);
  }, []);

  const handleGenerate = async () => {
    if (!rawDescription.trim()) {
      setError("Please describe the bug");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await generateBugReport(rawDescription, appType, severity);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/40";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/40";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1": return "bg-red-500/20 text-red-400 border-red-500/40";
      case "P2": return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "P3": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "P4": return "bg-green-500/20 text-green-400 border-green-500/40";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const handleCopyJira = () => {
    if (!result) return;
    const r = result.bug_report;
    const jiraText = `*${r.title}*\n\n*Severity:* ${r.severity}\n*Priority:* ${r.priority}\n*Reproducibility:* ${r.reproducibility}\n\n*Environment:*\n- OS: ${r.environment.os}\n- Browser: ${r.environment.browser}\n- Version: ${r.environment.app_version}\n- Device: ${r.environment.device}\n\n*Steps to Reproduce:*\n${r.steps_to_reproduce.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n*Expected Result:*\n${r.expected_result}\n\n*Actual Result:*\n${r.actual_result}\n\n*Impact:* ${r.impact}\n*Possible Cause:* ${r.possible_cause}\n*Suggested Fix:* ${r.suggested_fix}\n*Test Data:* ${r.test_data_used}\n*Labels:* ${r.labels.join(", ")}\n*Attachments Needed:* ${r.attachments_needed.join(", ")}`;
    navigator.clipboard.writeText(jiraText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exampleBugs = [
    "login button not working on mobile, tried safari and chrome, keeps spinning forever after clicking, happens every time",
    "checkout page crashes when i add more than 5 items to cart, total shows wrong price too, using chrome on windows",
    "password reset email never arrives, checked spam too, tried 3 different email addresses yesterday",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← Back</Link>
            <span className="text-gray-600">|</span>
            <span className="text-xl">🐛</span>
            <h1 className="text-xl font-bold text-white">Bug Report Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Using:</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
              {providerLabel[provider] ?? provider}
            </span>
            <a href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">Change →</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Describe the Bug</h2>
          <p className="text-sm text-gray-400 mb-4">Write it however you want — messy, casual, incomplete. AI will clean it up into a professional report.</p>

          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">Raw Bug Description <span className="text-red-400">*</span></label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              rows={5}
              placeholder="Just describe what went wrong in your own words..."
              value={rawDescription}
              onChange={(e) => setRawDescription(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2">Quick examples — click to use:</p>
            <div className="flex flex-col gap-2">
              {exampleBugs.map((bug, i) => (
                <button key={i} onClick={() => setRawDescription(bug)}
                  className="text-left text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg px-3 py-2 transition-all">
                  🐛 {bug}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">App Type</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none" value={appType} onChange={(e) => setAppType(e.target.value)}>
                <option>Web Application</option>
                <option>Mobile App (iOS)</option>
                <option>Mobile App (Android)</option>
                <option>API / Backend</option>
                <option>Desktop Application</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Initial Severity</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">⚠️ {error}</div>}

          <button onClick={handleGenerate} disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
            {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating Bug Report...</>) : <>🐛 Generate Professional Bug Report</>}
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">BUG TITLE</p>
                  <h2 className="text-lg font-bold text-white">{result.bug_report.title}</h2>
                </div>
                <button onClick={handleCopyJira}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                  {copied ? "✅ Copied!" : "📋 Copy for Jira"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getSeverityColor(result.bug_report.severity)}`}>🔴 Severity: {result.bug_report.severity}</span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getPriorityColor(result.bug_report.priority)}`}>⚡ {result.bug_report.priority}</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/40">🔄 {result.bug_report.reproducibility}</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full border bg-gray-500/20 text-gray-400 border-gray-500/40">📌 {result.bug_report.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">🖥️ Environment</h3>
                  <div className="space-y-2">
                    {Object.entries(result.bug_report.environment).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key.replace("_", " ")}:</span>
                        <span className="text-gray-300">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">📋 Steps to Reproduce</h3>
                  <ol className="space-y-2">
                    {result.bug_report.steps_to_reproduce.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                        <span className="text-gray-300">{step.replace(/^Step \d+:\s*/i, "")}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">🔍 Expected vs Actual</h3>
                  <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-xs text-green-400 font-medium mb-1">✅ EXPECTED</p>
                      <p className="text-sm text-gray-300">{result.bug_report.expected_result}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-xs text-red-400 font-medium mb-1">❌ ACTUAL</p>
                      <p className="text-sm text-gray-300">{result.bug_report.actual_result}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">💥 Impact</h3>
                  <p className="text-sm text-gray-400">{result.bug_report.impact}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">🔬 Possible Cause</h3>
                  <p className="text-sm text-gray-400">{result.bug_report.possible_cause}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">🛠️ Suggested Fix</h3>
                  <p className="text-sm text-gray-400">{result.bug_report.suggested_fix}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">🧪 Test Data Used</h3>
                  <p className="text-sm text-gray-400">{result.bug_report.test_data_used}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">🏷️ Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.bug_report.labels.map((label, i) => (
                      <span key={i} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">{label}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">📎 Attachments Needed</h3>
                  <ul className="space-y-1">
                    {result.bug_report.attachments_needed.map((item, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-center gap-2"><span className="text-gray-600">•</span> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}