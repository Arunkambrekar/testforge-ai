"use client";

import { useState } from "react";

interface ExportBarProps {
  onCopy: () => void;
  onDownloadPDF: () => void;
  onDownloadCSV?: () => void;
  itemCount?: number;
  label?: string;
}

export default function ExportBar({
  onCopy,
  onDownloadPDF,
  onDownloadCSV,
  itemCount,
  label = "results",
}: ExportBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
      <span className="text-green-400 font-semibold text-sm">
        ✅ {itemCount !== undefined ? `${itemCount} ${label} generated` : "Generated successfully"}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded-lg transition-all"
        >
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>

        {onDownloadCSV && (
          <button
            onClick={onDownloadCSV}
            className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 px-3 py-2 rounded-lg transition-all"
          >
            📊 CSV
          </button>
        )}

        <button
          onClick={onDownloadPDF}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-2 rounded-lg transition-all"
        >
          📄 PDF
        </button>
      </div>
    </div>
  );
}