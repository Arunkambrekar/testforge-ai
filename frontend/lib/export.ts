import jsPDF from "jspdf";

// ─────────────────────────────────────
// CSV EXPORT
// ─────────────────────────────────────

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          const str = Array.isArray(val)
            ? val.join(" | ")
            : String(val ?? "");
          // Escape commas and quotes
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────
// PDF EXPORT — Test Cases
// ─────────────────────────────────────

export function exportTestCasesToPDF(
  testCases: Record<string, unknown>[],
  title: string,
  filename: string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) addPage();
  };

  // Header
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TestForgeAI", margin, 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, margin, 18);
  doc.setFontSize(8);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth - margin - 40,
    18
  );

  y = 35;

  // Test cases
  testCases.forEach((tc, index) => {
    checkPage(45);

    // Card background
    doc.setFillColor(31, 41, 55);
    doc.roundedRect(margin, y, contentWidth, 40, 2, 2, "F");

    // TC ID + Priority
    doc.setTextColor(96, 165, 250);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(String(tc.tc_id || tc.id || `TC-${index + 1}`), margin + 4, y + 7);

    const priority = String(tc.priority || "Medium").toUpperCase();
    const priorityColors: Record<string, [number, number, number]> = {
      CRITICAL: [239, 68, 68],
      HIGH: [249, 115, 22],
      MEDIUM: [234, 179, 8],
      LOW: [34, 197, 94],
    };
    const [r, g, b] = priorityColors[priority] || [107, 114, 128];
    doc.setTextColor(r, g, b);
    doc.text(priority, pageWidth - margin - 25, y + 7);

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const titleText = String(tc.title || tc.name || "");
    const titleLines = doc.splitTextToSize(titleText, contentWidth - 10);
    doc.text(titleLines[0], margin + 4, y + 14);

    // Category
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(String(tc.category || tc.type || ""), margin + 4, y + 21);

    // Steps (truncated)
    const steps = Array.isArray(tc.steps)
      ? tc.steps.slice(0, 2).join(" → ")
      : String(tc.steps || "");
    const stepsLines = doc.splitTextToSize(steps, contentWidth - 10);
    doc.text(stepsLines[0] || "", margin + 4, y + 28);

    // Expected
    doc.setTextColor(34, 197, 94);
    const expected = String(tc.expected_result || tc.expected || "");
    const expLines = doc.splitTextToSize(`✓ ${expected}`, contentWidth - 10);
    doc.text(expLines[0] || "", margin + 4, y + 35);

    y += 45;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(17, 24, 39);
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(7);
    doc.text(
      `TestForgeAI — Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 4,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}

// ─────────────────────────────────────
// PDF EXPORT — Bug Report
// ─────────────────────────────────────

export function exportBugReportToPDF(
  bugReport: Record<string, unknown>,
  filename: string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addSection = (label: string, value: string, color?: [number, number, number]) => {
    checkPage(20);
    doc.setFillColor(31, 41, 55);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 4, y + 6);
    doc.setTextColor(...(color || ([255, 255, 255] as [number, number, number])));
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, contentWidth - 8);
    doc.text(lines[0], margin + 4, y + 12);
    y += 20;
  };

  // Header
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TestForgeAI — Bug Report", margin, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 18);
  y = 35;

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(String(bugReport.title || ""), contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 5;

  addSection("SEVERITY", String(bugReport.severity || ""), [239, 68, 68]);
  addSection("PRIORITY", String(bugReport.priority || ""), [249, 115, 22]);
  addSection("REPRODUCIBILITY", String(bugReport.reproducibility || ""));
  addSection("IMPACT", String(bugReport.impact || ""));
  addSection("EXPECTED RESULT", String(bugReport.expected_result || ""), [34, 197, 94]);
  addSection("ACTUAL RESULT", String(bugReport.actual_result || ""), [239, 68, 68]);
  addSection("POSSIBLE CAUSE", String(bugReport.possible_cause || ""));
  addSection("SUGGESTED FIX", String(bugReport.suggested_fix || ""), [96, 165, 250]);

  // Steps
  checkPage(30);
  doc.setFillColor(31, 41, 55);
  const steps = Array.isArray(bugReport.steps_to_reproduce)
    ? (bugReport.steps_to_reproduce as string[])
    : [];
  doc.roundedRect(margin, y, contentWidth, 10 + steps.length * 8, 2, 2, "F");
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("STEPS TO REPRODUCE", margin + 4, y + 6);
  y += 10;
  steps.forEach((step, i) => {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(`${i + 1}. ${step}`, contentWidth - 8);
    doc.text(lines, margin + 4, y);
    y += lines.length * 6 + 2;
  });

  doc.save(`${filename}.pdf`);
}

// ─────────────────────────────────────
// PDF EXPORT — Generic text
// ─────────────────────────────────────

export function exportGenericToPDF(
  sections: { label: string; content: string | string[] }[],
  title: string,
  filename: string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TestForgeAI — ${title}`, margin, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 18);
  y = 35;

  sections.forEach((section) => {
    if (y + 25 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    const content = Array.isArray(section.content)
      ? section.content.join("\n")
      : section.content;

    doc.setFillColor(31, 41, 55);
    const lines = doc.splitTextToSize(content, contentWidth - 8);
    const blockH = 12 + lines.length * 6;
    doc.roundedRect(margin, y, contentWidth, blockH, 2, 2, "F");

    doc.setTextColor(96, 165, 250);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(section.label.toUpperCase(), margin + 4, y + 6);

    doc.setTextColor(209, 213, 219);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(lines, margin + 4, y + 12);

    y += blockH + 5;
  });

  doc.save(`${filename}.pdf`);
}