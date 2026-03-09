"use client";

import { useState } from "react";
import { useJira } from "@/context/JiraContext";
import { useSprintIssues, useBurndownData, useSprintDetails } from "@/hooks/useSprintData";
import { calculateHealthScore } from "@/lib/health-score";
import type { SprintReport } from "@/types";
import SprintSelector from "@/components/reports/SprintSelector";
import ReportGenerator from "@/components/reports/ReportGenerator";
import ExportButtons from "@/components/reports/ExportButtons";
import { Loader2, FileBarChart } from "lucide-react";

export default function ReportsPage() {
  const { sprints } = useJira();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: sprint } = useSprintDetails(selectedId);
  const { data: issues, isLoading: issuesLoading } = useSprintIssues(selectedId);
  const { data: burndown, isLoading: burndownLoading } = useBurndownData(selectedId);

  const isLoading = issuesLoading || burndownLoading;

  let report: SprintReport | null = null;

  if (sprint && issues && burndown) {
    const totalPoints = issues.reduce((sum, i) => sum + i.storyPoints, 0);
    const completedPoints = issues
      .filter((i) => i.statusCategory === "Done")
      .reduce((sum, i) => sum + i.storyPoints, 0);

    const issuesByType: Record<string, number> = {};
    const issuesByPriority: Record<string, number> = {};
    const issuesByAssignee: Record<string, number> = {};

    issues.forEach((issue) => {
      issuesByType[issue.issueType] = (issuesByType[issue.issueType] || 0) + 1;
      issuesByPriority[issue.priority] =
        (issuesByPriority[issue.priority] || 0) + 1;
      const assignee = issue.assignee?.displayName || "Unassigned";
      issuesByAssignee[assignee] = (issuesByAssignee[assignee] || 0) + 1;
    });

    report = {
      sprint,
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      totalIssues: issues.length,
      completedIssues: issues.filter((i) => i.statusCategory === "Done").length,
      healthScore: calculateHealthScore(burndown, issues, totalPoints),
      burndown,
      issuesByType,
      issuesByPriority,
      issuesByAssignee,
    };
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprint Reports</h1>
          <p className="text-sm text-gray-500">
            Generate and export comprehensive sprint reports
          </p>
        </div>
        <ExportButtons report={report} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sprint Selector Sidebar */}
        <div className="lg:col-span-1">
          <SprintSelector
            sprints={sprints}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          {!selectedId && (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400">
              <FileBarChart className="mb-3 h-12 w-12" />
              <p className="text-lg font-medium">Select a sprint</p>
              <p className="text-sm">
                Choose a sprint from the list to generate a report
              </p>
            </div>
          )}

          {selectedId && isLoading && (
            <div className="flex h-96 items-center justify-center rounded-xl border border-gray-200 bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {report && !isLoading && <ReportGenerator report={report} />}
        </div>
      </div>
    </div>
  );
}
