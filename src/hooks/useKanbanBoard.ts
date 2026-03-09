"use client";

import { useState, useCallback, useMemo } from "react";
import type { SprintIssue, KanbanColumn } from "@/types";

export function useKanbanBoard(issues: SprintIssue[] | undefined) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredIssues = useMemo(() => {
    if (!issues) return [];
    return issues.filter((issue) => {
      if (
        searchQuery &&
        !issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !issue.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (
        filterAssignee &&
        issue.assignee?.displayName !== filterAssignee
      )
        return false;
      if (filterPriority && issue.priority !== filterPriority) return false;
      if (filterType && issue.issueType !== filterType) return false;
      return true;
    });
  }, [issues, searchQuery, filterAssignee, filterPriority, filterType]);

  const columns = useMemo<KanbanColumn[]>(() => {
    // Always show all three columns
    const defaultColumns: KanbanColumn[] = [
      { id: "To Do", title: "To Do", statusCategory: "To Do", issues: [] },
      { id: "In Progress", title: "In Progress", statusCategory: "In Progress", issues: [] },
      { id: "Done", title: "Done", statusCategory: "Done", issues: [] },
    ];

    // Group issues by their status category
    filteredIssues.forEach((issue) => {
      const col = defaultColumns.find((c) => c.statusCategory === issue.statusCategory);
      if (col) {
        col.issues.push(issue);
      } else {
        // If status category doesn't match, put in To Do
        defaultColumns[0].issues.push(issue);
      }
    });

    return defaultColumns;
  }, [filteredIssues]);

  const moveIssue = useCallback(
    async (issueKey: string, targetStatus: string) => {
      setIsUpdating(issueKey);
      try {
        // Get available transitions for the issue
        const transRes = await fetch(`/api/jira/issue/${issueKey}`);
        if (!transRes.ok) throw new Error("Failed to get transitions");
        const transitions = await transRes.json();

        // Find a transition that matches the target status category
        const transition = transitions.find(
          (t: { name: string; to: { name: string; statusCategory?: { name?: string } } }) =>
            t.to.name === targetStatus ||
            t.name === targetStatus ||
            t.to.statusCategory?.name === targetStatus
        );

        if (!transition) {
          throw new Error(
            `No transition available to "${targetStatus}" for ${issueKey}`
          );
        }

        // Execute the transition
        const updateRes = await fetch(`/api/jira/issue/${issueKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transitionId: transition.id }),
        });

        if (!updateRes.ok) throw new Error("Failed to update issue");
        return true;
      } catch (error) {
        console.error("Failed to move issue:", error);
        return false;
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  // Get unique values for filters
  const assignees = useMemo(
    () => [...new Set(issues?.map((i) => i.assignee?.displayName).filter(Boolean) as string[])],
    [issues]
  );
  const priorities = useMemo(
    () => [...new Set(issues?.map((i) => i.priority))],
    [issues]
  );
  const issueTypes = useMemo(
    () => [...new Set(issues?.map((i) => i.issueType))],
    [issues]
  );

  return {
    columns,
    searchQuery,
    setSearchQuery,
    filterAssignee,
    setFilterAssignee,
    filterPriority,
    setFilterPriority,
    filterType,
    setFilterType,
    moveIssue,
    isUpdating,
    assignees,
    priorities,
    issueTypes,
  };
}
