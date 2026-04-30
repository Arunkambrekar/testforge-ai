"use client";

import Link from "next/link";

const features = [
  {
    title: "Test Case Generator",
    description: "Describe a feature and get 15-20 structured test cases with steps, priority, and test data.",
    icon: "🧪",
    href: "/generator",
    accent: "blue",
    status: "live",
  },
  {
    title: "API Test Generator",
    description: "Input an endpoint and get 12+ API test cases covering status codes, security, and edge cases.",
    icon: "🔌",
    href: "/api-tests",
    accent: "cyan",
    status: "live",
  },
  {
    title: "Automation Script Generator",
    description: "Describe a user flow and get complete Playwright + PyTest code with Page Object Model.",
    icon: "⚡",
    href: "/automation",
    accent: "purple",
    status: "live",
  },
  {
    title: "Bug Report Generator",
    description: "Paste a messy bug description and get a professional Jira-ready report with steps, severity, impact and fix suggestions.",
    icon: "🐛",
    href: "/bug-report",
    accent: "orange",
    status: "live",
  },
  {
    title: "Edge Case Suggester",
    description: "Uncover hidden edge cases most testers miss — network, session, security, and more.",
    icon: "🔍",
    href: "/edge-cases",
    accent: "yellow",
    status: "live",
  },
  {
    title: "AI Error Explainer",
    description: "Paste any error or stack trace and get root cause, reason and exact fix steps instantly.",
    icon: "🤖",
    href: "/ai-explain",
    accent: "red",
    status: "live",
  },
  {
    title: "Test Data Generator",
    description: "Generate valid, invalid, boundary and special character test data for any form or field.",
    icon: "📊",
    href: "/test-data",
    accent: "green",
    status: "live",
  },
];

const accentMap: Record<string, { border: string; icon: string; badge: string; btn: string }> = {
  blue: {
    border: "hover:border-blue-500/60",
    icon: "bg-blue-500/15 border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-500",
  },
  cyan: {
    border: "hover:border-cyan-500/60",
    icon: "bg-cyan-500/15 border-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-400",
    btn: "bg-cyan-600 hover:bg-cyan-500",
  },
  purple: {
    border: "hover:border-purple-500/60",
    icon: "bg-purple-500/15 border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-400",
    btn: "bg-purple-600 hover:bg-purple-500",
  },
  orange: {
    border: "hover:border-orange-500/60",
    icon: "bg-orange-500/15 border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-400",
    btn: "bg-orange-600 hover:bg-orange-500",
  },
  yellow: {
    border: "hover:border-yellow-500/60",
    icon: "bg-yellow-500/15 border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-400",
    btn: "bg-yellow-600 hover:bg-yellow-500",
  },
  green: {
    border: "hover:border-green-500/60",
    icon: "bg-green-500/15 border-green-500/30",
    badge: "bg-green-500/20 text-green-400",
    btn: "bg-green-600 hover:bg-green-500",
  },
  red: {
    border: "hover:border-red-500/60",
    icon: "bg-red-500/15 border-red-500/30",
    badge: "bg-red-500/20 text-red-400",
    btn: "bg-red-600 hover:bg-red-500",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="border-b border-gray-800 bg-gray-900/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold text-lg tracking-tight">TestForgeAI</span>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Beta</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            All systems operational
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-6">
            ✦ AI-Powered QA Platform
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Ship quality software
            <span className="block text-blue-400">10× faster</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Generate test cases, automation scripts, bug reports, and more — powered by Claude AI.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-14 max-w-lg mx-auto">
          {[
            { label: "Features", value: "7" },
            { label: "Live Now", value: "7" },
            { label: "AI Model", value: "Claude" },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-gray-900 border border-gray-800 rounded-xl py-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const colors = accentMap[feature.accent];
            const isLive = feature.status === "live";

            const cardContent = (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl ${colors.icon}`}>
                    {feature.icon}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.badge}`}>
                    {isLive ? "Live" : "Coming Soon"}
                  </span>
                </div>
                <h2 className="text-white font-semibold text-base mb-2">{feature.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{feature.description}</p>
                <div className={`w-full py-2.5 rounded-xl text-sm font-medium text-white text-center transition-all ${colors.btn}`}>
                  {isLive ? `Open ${feature.title.split(" ")[0]}` : "Coming Soon"}
                </div>
              </>
            );

            if (isLive) {
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className={`block bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900/80 no-underline ${colors.border}`}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div
                key={feature.href}
                className="block bg-gray-900 border border-gray-800 rounded-2xl p-6 opacity-60 cursor-default"
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-700 text-sm mt-16">
          Built with FastAPI · Next.js · Claude AI
        </p>
      </div>
    </main>
  );
}