import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SprintReport } from "@/types";

export function exportToJSON(report: SprintReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `sprint-report-${report.sprint.name}.json`);
}

export function exportToCSV(report: SprintReport): void {
  const lines: string[] = [];

  // Header section
  lines.push("Sprint Report");
  lines.push(`Sprint,${report.sprint.name}`);
  lines.push(
    `Period,${report.sprint.startDate.split("T")[0]} to ${report.sprint.endDate.split("T")[0]}`
  );
  lines.push(`State,${report.sprint.state}`);
  lines.push("");

  // Summary
  lines.push("Summary");
  lines.push(`Total Story Points,${report.totalPoints}`);
  lines.push(`Completed Points,${report.completedPoints}`);
  lines.push(`Remaining Points,${report.remainingPoints}`);
  lines.push(`Total Issues,${report.totalIssues}`);
  lines.push(`Completed Issues,${report.completedIssues}`);
  lines.push(
    `Completion Rate,${report.totalIssues > 0 ? Math.round((report.completedIssues / report.totalIssues) * 100) : 0}%`
  );
  lines.push(`Health Score,${report.healthScore.score} (${report.healthScore.level})`);
  lines.push("");

  // Burndown data
  lines.push("Burndown Data");
  lines.push("Date,Ideal,Actual");
  report.burndown.forEach((point) => {
    lines.push(
      `${point.date},${point.ideal.toFixed(1)},${point.actual.toFixed(1)}`
    );
  });
  lines.push("");

  // Issues by type
  lines.push("Issues by Type");
  lines.push("Type,Count");
  Object.entries(report.issuesByType).forEach(([type, count]) => {
    lines.push(`${type},${count}`);
  });
  lines.push("");

  // Issues by priority
  lines.push("Issues by Priority");
  lines.push("Priority,Count");
  Object.entries(report.issuesByPriority).forEach(([priority, count]) => {
    lines.push(`${priority},${count}`);
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  downloadBlob(blob, `sprint-report-${report.sprint.name}.csv`);
}

export function exportToPDF(report: SprintReport): void {
  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text("Sprint Report", 14, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text(report.sprint.name, 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(
    `${report.sprint.startDate.split("T")[0]} to ${report.sprint.endDate.split("T")[0]}`,
    14,
    y
  );
  y += 12;

  // Executive Summary
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Executive Summary", 14, y);
  y += 8;

  const completionRate =
    report.totalIssues > 0
      ? Math.round((report.completedIssues / report.totalIssues) * 100)
      : 0;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const summaryLines = [
    `Health Score: ${report.healthScore.score}/100 (${report.healthScore.level.toUpperCase()})`,
    `Story Points: ${report.completedPoints}/${report.totalPoints} completed`,
    `Issues: ${report.completedIssues}/${report.totalIssues} completed (${completionRate}%)`,
    `Active Blockers: ${report.healthScore.factors.blockerCount}`,
    `Open Bugs: ${report.healthScore.factors.bugCount}`,
  ];

  summaryLines.forEach((line) => {
    doc.text(line, 14, y);
    y += 6;
  });
  y += 6;

  // Issues by Type table
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Issues by Type", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Type", "Count"]],
    body: Object.entries(report.issuesByType).map(([type, count]) => [
      type,
      count.toString(),
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Issues by Priority table
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Issues by Priority", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Priority", "Count"]],
    body: Object.entries(report.issuesByPriority).map(([priority, count]) => [
      priority,
      count.toString(),
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Issues by Assignee table
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Issues by Assignee", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Assignee", "Issues"]],
    body: Object.entries(report.issuesByAssignee).map(([assignee, count]) => [
      assignee,
      count.toString(),
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`sprint-report-${report.sprint.name}.pdf`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
