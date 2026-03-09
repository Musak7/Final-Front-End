"use client";

import { useState, useEffect, useCallback } from "react";
import type { Alert, SprintIssue } from "@/types";

export function useAlerts(issues: SprintIssue[] | undefined) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [previousIssues, setPreviousIssues] = useState<SprintIssue[]>([]);

  useEffect(() => {
    if (!issues) return;

    const newAlerts: Alert[] = [];

    // Check for new blockers
    issues
      .filter((issue) => issue.blocked)
      .forEach((issue) => {
        const wasBlocked = previousIssues.find(
          (p) => p.key === issue.key
        )?.blocked;
        if (!wasBlocked) {
          newAlerts.push({
            id: `blocker-${issue.key}-${Date.now()}`,
            type: "blocker",
            message: `${issue.key} is blocked: ${issue.summary}`,
            issueKey: issue.key,
            timestamp: new Date().toISOString(),
            dismissed: false,
          });
        }
      });

    // Check for new bugs
    issues
      .filter(
        (issue) =>
          issue.issueType.toLowerCase() === "bug" &&
          issue.statusCategory !== "Done"
      )
      .forEach((issue) => {
        const existed = previousIssues.find((p) => p.key === issue.key);
        if (!existed) {
          newAlerts.push({
            id: `bug-${issue.key}-${Date.now()}`,
            type: "bug",
            message: `New bug reported: ${issue.key} - ${issue.summary}`,
            issueKey: issue.key,
            timestamp: new Date().toISOString(),
            dismissed: false,
          });
        }
      });

    // Check for scope changes (new issues added)
    if (previousIssues.length > 0) {
      const newIssueKeys = issues
        .filter((i) => !previousIssues.find((p) => p.key === i.key))
        .map((i) => i.key);

      if (newIssueKeys.length > 0) {
        newAlerts.push({
          id: `scope-${Date.now()}`,
          type: "scope-change",
          message: `Scope change: ${newIssueKeys.length} new issue(s) added to sprint`,
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));
    }

    setPreviousIssues(issues);
  }, [issues]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a))
    );
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, dismissed: true })));
  }, []);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return { alerts: activeAlerts, allAlerts: alerts, dismissAlert, dismissAll };
}
