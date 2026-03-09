"use client";

import { useJira } from "@/context/JiraContext";
import { useSprintIssues, useBurndownData, useSprintDetails } from "@/hooks/useSprintData";
import { useAlerts } from "@/hooks/useAlerts";
import { calculateHealthScore } from "@/lib/health-score";
import SprintSummary from "@/components/dashboard/SprintSummary";
import BurndownChart from "@/components/dashboard/BurndownChart";
import HealthScoreWidget from "@/components/dashboard/HealthScore";
import AlertsPanel from "@/components/dashboard/AlertsPanel";

export default function DashboardPage() {
  const { selectedSprintId } = useJira();
  const { data: sprint } = useSprintDetails(selectedSprintId);
  const { data: issues } = useSprintIssues(selectedSprintId);
  const { data: burndown, isLoading: burndownLoading } = useBurndownData(selectedSprintId);
  const { alerts, dismissAlert, dismissAll } = useAlerts(issues);

  const totalPoints = issues?.reduce((sum, i) => sum + i.storyPoints, 0) || 0;
  const healthScore =
    issues && burndown
      ? calculateHealthScore(burndown, issues, totalPoints)
      : null;

  return (
    <div className="space-y-6">
      {/* Sprint Summary Cards */}
      <SprintSummary sprint={sprint} issues={issues} />

      {/* Charts and Health Score Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BurndownChart data={burndown} isLoading={burndownLoading} />
        </div>
        <div>
          <HealthScoreWidget
            healthScore={healthScore}
            isLoading={!issues}
          />
        </div>
      </div>

      {/* Alerts */}
      <AlertsPanel
        alerts={alerts}
        onDismiss={dismissAlert}
        onDismissAll={dismissAll}
      />
    </div>
  );
}
