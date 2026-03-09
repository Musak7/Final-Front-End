"use client";

import { useJira } from "@/context/JiraContext";
import { useSprintIssues } from "@/hooks/useSprintData";
import { useKanbanBoard } from "@/hooks/useKanbanBoard";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Loader2 } from "lucide-react";

export default function KanbanPage() {
  const { selectedSprintId } = useJira();
  const { data: issues, isLoading, mutate } = useSprintIssues(selectedSprintId);
  const kanban = useKanbanBoard(issues);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!selectedSprintId) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        Select a sprint to view the Kanban board
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-sm text-gray-500">
          Drag and drop tasks between columns to update their status in Jira
        </p>
      </div>
      <KanbanBoard kanban={kanban} onMutate={() => mutate()} />
    </div>
  );
}
