"use client";

import { useEffect, useState } from "react";
import { generateEdgeCases } from "@/lib/api";

interface EdgeCase {
  id: string;
  title: string;
  scenario: string;
  why_missed: string;
  impact: string;
  risk: string;
  test_hint: string;
}

interface Category {
  name: string;
  icon: string;
  risk: string;
  cases: EdgeCase[];
}

interface TopRisk {
  area: string;
  description: string;
  severity: string;
}

interface EdgeCaseResult {
  feature_summary: string;
  coverage_score: number;
  risk_level: string;
  total_edge_cases: number;
  categories: Category[];
  missing_areas: string[];
  top_risks: TopRisk[];
}

const riskColor = (risk: string) => {
  switch (risk?.toLowerCase()) {
    case "critical": return "text-red-400 bg-red-400/10 border-red-400/30";
    case "high":     return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    case "medium":   return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "low":      return "text-green-400 bg-green-400/10 border-green-400/30";
    default:         return "text-gray-400 bg-gray-400/10 border-gray-400/30";
  }
};

const scoreColor = (score: number) => {
  if (score >= 75) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 25) return "text-orange-400";
  return "text-red-400";
};

const scoreBarColor = (score: number) => {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
};

export default function EdgeCasesPage() {
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureType, setFeatureType] = useState("Web Application");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EdgeCaseResult | null>(null);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState("groq");

  useEffect(() => {
    const saved = localStorage.getItem("ai_provider");
    if (saved) setProvider(saved);
  }, []);

  const handleGenerate = async () => {
    if (!featureDescription.trim()) {
      setError("Please describe the feature you want to analyze.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await generateEdgeCases({ feature_description: featureDescription, feature_type: featureType });
      setResult(data);
      setActiveCategory(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!result) return;
    const lines: string[] = [
      `EDGE CASE ANALYSIS — ${result.feature_summary}`,
      `Coverage Score: ${result.coverage_score}/100 | Risk: ${result.risk_level}`,
      `Total Cases: ${result.total_edge_cases}`,
      "",
    ];
    result.categories.forEach(cat => {
      lines.push(`\n== ${cat.name} (${cat.risk}) ==`);
      cat.cases.forEach(c => {
        lines.push(`\n${c.id}: ${c.title}`);
        lines.push(`Scenario: ${c.scenario}`);
        lines.push(`Why Missed: ${c.why_missed}`);
        lines.push(`Impact: ${c.impact}`);
        lines.push(`Risk: ${c.risk}`);
        lines.push(`Tip: ${c.test_hint}`);
      });
    });
    lines.push("\n\nMISSING AREAS:");
    result.missing_areas.forEach(a => lines.push(`- ${a}`));
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const examples = [
    "User login with email and password including remember me functionality",
    "Add to cart and checkout flow in an e-commerce application",
    "File upload feature that accepts PDF, images and documents up to 10MB",
    "User profile update form with name, email, phone and avatar",
  ];

  const featureTypes = [
    "Web Application", "REST API", "Mobile App",
    "Authentication", "Payment Flow", "File Upload", "Search Feature",
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← Back</a>
            <span className="text-gray-700">|</span>
            <span className="text-blue-400 font-semibold">TestForgeAI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Using:</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
              {provider === "groq" ? "⚡ Groq" : provider === "openai" ? "OpenAI" : "Claude"}
            </span>
            <a href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">Change →</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-xl">🔍</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edge Case Suggester</h1>
              <p className="text-gray-400 text-sm">Uncover hidden scenarios most testers miss — with risk levels and coverage score</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Input */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Feature Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                placeholder="Describe the feature you want to find edge cases for..."
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500/60 resize-none"
              />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Feature Type</label>
              <select
                value={featureType}
                onChange={(e) => setFeatureType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/60"
              >
                {featureTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Examples */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Quick Examples</p>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setFeatureDescription(ex)}
                    className="w-full text-left text-xs text-gray-400 hover:text-yellow-400 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-all border border-gray-700 hover:border-yellow-500/40"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-950 font-bold rounded-xl transition-all text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing...
                </span>
              ) : "🔍 Find Edge Cases"}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
            )}
          </div>

          {/* Right — Output */}
          <div className="lg:col-span-2 space-y-4">
            {!result && !loading && (
              <div className="min-h-96 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-lg font-medium text-gray-500">Edge cases will appear here</p>
                  <p className="text-sm text-gray-600 mt-1">Coverage score · Risk levels · Hidden scenarios</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="min-h-96 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="flex gap-1.5 justify-center mb-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">Analyzing feature for edge cases...</p>
                  <p className="text-gray-600 text-xs mt-1">Finding what most testers miss</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Score Bar */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-semibold">{result.feature_summary}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{result.total_edge_cases} edge cases found across {result.categories?.length} categories</p>
                    </div>
                    <button
                      onClick={handleCopyAll}
                      className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-all"
                    >
                      {copied ? "✓ Copied!" : "Copy All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className={`text-3xl font-bold ${scoreColor(result.coverage_score)}`}>
                        {result.coverage_score}
                        <span className="text-lg">/100</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">Coverage Score</p>
                      <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreBarColor(result.coverage_score)}`}
                          style={{ width: `${result.coverage_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className={`text-2xl font-bold ${riskColor(result.risk_level).split(" ")[0]}`}>
                        {result.risk_level}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">Overall Risk</p>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColor(result.risk_level)}`}>
                          {result.risk_level}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-400">{result.total_edge_cases}</div>
                      <p className="text-gray-500 text-xs mt-1">Cases Found</p>
                      <p className="text-gray-600 text-xs mt-2">{result.categories?.length} categories</p>
                    </div>
                  </div>
                </div>

                {/* Top Risks */}
                {result.top_risks?.length > 0 && (
                  <div className="bg-gray-900 border border-red-500/20 rounded-xl p-5">
                    <p className="text-sm font-semibold text-red-400 mb-3">🚨 Top Risk Areas</p>
                    <div className="space-y-2">
                      {result.top_risks.map((risk, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-800 rounded-lg px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border mt-0.5 shrink-0 ${riskColor(risk.severity)}`}>
                            {risk.severity}
                          </span>
                          <div>
                            <p className="text-white text-sm font-medium">{risk.area}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{risk.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Tabs */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="flex overflow-x-auto border-b border-gray-800">
                    {result.categories?.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCategory(i)}
                        className={`shrink-0 px-4 py-3 text-xs font-medium transition-all whitespace-nowrap ${
                          activeCategory === i
                            ? "bg-gray-800 text-white border-b-2 border-yellow-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {cat.icon} {cat.name}
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded border ${riskColor(cat.risk)}`}>
                          {cat.cases?.length}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 space-y-3 overflow-y-auto max-h-[500px]">
                    {result.categories?.[activeCategory]?.cases?.map((ec) => (
                      <div key={ec.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedCase(expandedCase === ec.id ? null : ec.id)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-700/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-mono">{ec.id}</span>
                            <span className="text-white text-sm font-medium">{ec.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded border ${riskColor(ec.risk)}`}>
                              {ec.risk}
                            </span>
                            <span className="text-gray-500 text-xs">{expandedCase === ec.id ? "▲" : "▼"}</span>
                          </div>
                        </button>

                        {expandedCase === ec.id && (
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-700 pt-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Scenario</p>
                              <p className="text-gray-300 text-sm">{ec.scenario}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                                <p className="text-xs text-orange-400 mb-1">⚠ Why Testers Miss This</p>
                                <p className="text-gray-300 text-xs">{ec.why_missed}</p>
                              </div>
                              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                                <p className="text-xs text-red-400 mb-1">💥 Impact</p>
                                <p className="text-gray-300 text-xs">{ec.impact}</p>
                              </div>
                            </div>
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                              <p className="text-xs text-blue-400 mb-1">💡 Test Hint</p>
                              <p className="text-gray-300 text-xs">{ec.test_hint}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Areas */}
                {result.missing_areas?.length > 0 && (
                  <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-5">
                    <p className="text-sm font-semibold text-yellow-400 mb-3">⚠ Commonly Untested Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_areas.map((area, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}