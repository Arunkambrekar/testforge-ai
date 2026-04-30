"use client";

import { useState } from "react";
import { generateTestData } from "@/lib/api";

interface TestDataItem {
  value: string;
  description: string;
  expected_result: string;
}

interface TestDataResult {
  field_name: string;
  data_type: string;
  valid_data: TestDataItem[];
  invalid_data: TestDataItem[];
  boundary_data: TestDataItem[];
  special_characters: TestDataItem[];
  edge_cases: TestDataItem[];
  sql_injection: TestDataItem[];
  summary: string;
  total_values: number;
}

const DATA_TYPES = [
  "Text", "Email", "Password", "Phone Number",
  "Date", "Number", "URL", "Username",
  "Address", "Credit Card", "File Upload", "Dropdown",
];

const categoryConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  valid_data:         { label: "Valid Data",         color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  icon: "✅" },
  invalid_data:       { label: "Invalid Data",       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",      icon: "❌" },
  boundary_data:      { label: "Boundary Values",    color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",    icon: "📏" },
  special_characters: { label: "Special Characters", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: "🔣" },
  edge_cases:         { label: "Edge Cases",         color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: "⚠️" },
  sql_injection:      { label: "SQL Injection",      color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: "💉" },
};

export default function TestDataPage() {
  const [fieldDescription, setFieldDescription] = useState("");
  const [dataType, setDataType]                 = useState("Text");
  const [constraints, setConstraints]           = useState("");
  const [loading, setLoading]                   = useState(false);
  const [result, setResult]                     = useState<TestDataResult | null>(null);
  const [error, setError]                       = useState("");
  const [activeTab, setActiveTab]               = useState("valid_data");
  const [copied, setCopied]                     = useState(false);

  const handleGenerate = async () => {
    if (!fieldDescription.trim()) {
      setError("Please describe the field you want test data for.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await generateTestData({
        field_description: fieldDescription,
        data_type: dataType,
        constraints,
      });
      const parsed = data?.result ?? data;
      setResult(parsed);
      setActiveTab("valid_data");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!result) return;
    const lines: string[] = [`TEST DATA — ${result.field_name} (${result.data_type})`, ""];
    Object.keys(categoryConfig).forEach((key) => {
      const items = result[key as keyof TestDataResult] as TestDataItem[] | undefined;
      if (items?.length) {
        lines.push(`\n== ${categoryConfig[key].label} ==`);
        items.forEach((item) => {
          lines.push(`Value: ${item.value}`);
          lines.push(`Description: ${item.description}`);
          lines.push(`Expected: ${item.expected_result}`);
          lines.push("");
        });
      }
    });
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const rows = ["Category,Value,Description,Expected Result"];
    Object.keys(categoryConfig).forEach((key) => {
      const items = result[key as keyof TestDataResult] as TestDataItem[] | undefined;
      if (items?.length) {
        items.forEach((item) => {
          const val = `"${item.value?.toString().replace(/"/g, '""')}"`;
          const desc = `"${item.description?.replace(/"/g, '""')}"`;
          const exp = `"${item.expected_result?.replace(/"/g, '""')}"`;
          rows.push(`${categoryConfig[key].label},${val},${desc},${exp}`);
        });
      }
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-data-${dataType.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const examples = [
    { field: "Email address field for user registration", type: "Email", constraints: "Must be valid format, max 254 chars" },
    { field: "Password field with strength requirements", type: "Password", constraints: "Min 8 chars, uppercase, number, special char" },
    { field: "Phone number field for Indian users", type: "Phone Number", constraints: "10 digits, starts with 6-9" },
    { field: "Age field for user profile", type: "Number", constraints: "Must be between 18 and 100" },
  ];

  const activeItems = result
    ? (result[activeTab as keyof TestDataResult] as TestDataItem[] | undefined) ?? []
    : [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← Back</a>
            <span className="text-gray-700">|</span>
            <span className="text-blue-400 font-semibold">TestForgeAI</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            AI Ready
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">📊</div>
          <div>
            <h1 className="text-2xl font-bold text-white">Test Data Generator</h1>
            <p className="text-gray-400 text-sm">Describe a field → Get valid, invalid, boundary and security test data instantly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Input */}
          <div className="space-y-4">

            {/* Field Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Field Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={fieldDescription}
                onChange={(e) => setFieldDescription(e.target.value)}
                placeholder="e.g. Email address field for user registration form"
                className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/60 resize-none"
              />
            </div>

            {/* Data Type */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Type</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500/60"
              >
                {DATA_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Constraints */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Constraints <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Max 254 chars, must contain @ symbol, no spaces"
                className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/60 resize-none"
              />
            </div>

            {/* Examples */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Quick Examples</p>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFieldDescription(ex.field);
                      setDataType(ex.type);
                      setConstraints(ex.constraints);
                    }}
                    className="w-full text-left text-xs text-gray-400 hover:text-green-400 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-all border border-gray-700 hover:border-green-500/40"
                  >
                    {ex.field}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Generating Test Data...
                </span>
              ) : "📊 Generate Test Data"}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
            )}
          </div>

          {/* Right — Output */}
          <div className="lg:col-span-2">
            {!result && !loading && (
              <div className="min-h-96 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-lg font-medium text-gray-500">Test data will appear here</p>
                  <p className="text-sm text-gray-600 mt-1">Valid · Invalid · Boundary · Security · Edge cases</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="min-h-96 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="flex gap-1.5 justify-center mb-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">Generating test data...</p>
                  <p className="text-gray-600 text-xs mt-1">Creating valid, invalid and boundary values</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-white font-semibold">{result.field_name || fieldDescription}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{result.total_values || activeItems.length} total values · {result.data_type || dataType}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAll}
                      className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-all"
                    >
                      {copied ? "✓ Copied!" : "Copy All"}
                    </button>
                    <button
                      onClick={handleDownloadCSV}
                      className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all font-medium"
                    >
                      ⬇ Download CSV
                    </button>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="flex overflow-x-auto border-b border-gray-800">
                    {Object.keys(categoryConfig).map((key) => {
                      const items = result[key as keyof TestDataResult] as TestDataItem[] | undefined;
                      const count = items?.length ?? 0;
                      const cfg = categoryConfig[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`shrink-0 px-4 py-3 text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === key
                              ? "bg-gray-800 text-white border-b-2 border-green-400"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {cfg.icon} {cfg.label}
                          <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Data Table */}
                  <div className="p-4">
                    {activeItems.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-8">No data in this category</p>
                    ) : (
                      <div className="space-y-3">
                        {activeItems.map((item, i) => (
                          <div key={i} className={`border rounded-xl p-4 ${categoryConfig[activeTab]?.bg}`}>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <code className={`text-sm font-mono font-bold break-all ${categoryConfig[activeTab]?.color}`}>
                                {item.value}
                              </code>
                              <button
                                onClick={() => navigator.clipboard.writeText(item.value?.toString() || "")}
                                className="text-xs text-gray-500 hover:text-gray-300 shrink-0 transition-colors"
                              >
                                copy
                              </button>
                            </div>
                            <p className="text-gray-400 text-xs mb-1">{item.description}</p>
                            <p className="text-gray-500 text-xs">Expected: {item.expected_result}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Summary</p>
                    <p className="text-gray-300 text-sm">{result.summary}</p>
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