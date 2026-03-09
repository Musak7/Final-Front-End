"use client";

import type { SprintReport } from "@/types";
import { exportToPDF, exportToCSV, exportToJSON } from "@/lib/export";
import { FileText, FileSpreadsheet, FileJson, Download } from "lucide-react";

interface Props {
  report: SprintReport | null;
}

export default function ExportButtons({ report }: Props) {
  if (!report) return null;

  const buttons = [
    {
      label: "PDF",
      icon: FileText,
      color: "bg-red-50 text-red-700 hover:bg-red-100",
      onClick: () => exportToPDF(report),
    },
    {
      label: "CSV",
      icon: FileSpreadsheet,
      color: "bg-green-50 text-green-700 hover:bg-green-100",
      onClick: () => exportToCSV(report),
    },
    {
      label: "JSON",
      icon: FileJson,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      onClick: () => exportToJSON(report),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <Download className="h-4 w-4 text-gray-400" />
      <span className="text-sm text-gray-500">Export:</span>
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${btn.color}`}
        >
          <btn.icon className="h-3.5 w-3.5" />
          {btn.label}
        </button>
      ))}
    </div>
  );
}
