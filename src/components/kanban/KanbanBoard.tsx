"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import type { SprintIssue } from "@/types";
import type { useKanbanBoard } from "@/hooks/useKanbanBoard";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import FilterBar from "./FilterBar";

interface Props {
  kanban: ReturnType<typeof useKanbanBoard>;
  onMutate: () => void;
}

export default function KanbanBoard({ kanban, onMutate }: Props) {
  const [activeIssue, setActiveIssue] = useState<SprintIssue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const issue = event.active.data.current?.issue as SprintIssue | undefined;
    if (issue) setActiveIssue(issue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;

    if (!over) return;

    const activeIssueKey = active.id as string;
    const overId = over.id as string;

    // Find which column the card was dropped into
    const targetColumn = kanban.columns.find(
      (col) => col.id === overId || col.issues.some((i) => i.key === overId)
    );

    if (!targetColumn) return;

    // Find the source column
    const sourceColumn = kanban.columns.find((col) =>
      col.issues.some((i) => i.key === activeIssueKey)
    );

    // Only update if moving to a different column
    if (sourceColumn?.id === targetColumn.id) return;

    const success = await kanban.moveIssue(activeIssueKey, targetColumn.id);
    if (success) {
      onMutate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterBar
        searchQuery={kanban.searchQuery}
        onSearchChange={kanban.setSearchQuery}
        filterAssignee={kanban.filterAssignee}
        onAssigneeChange={kanban.setFilterAssignee}
        filterPriority={kanban.filterPriority}
        onPriorityChange={kanban.setFilterPriority}
        filterType={kanban.filterType}
        onTypeChange={kanban.setFilterType}
        assignees={kanban.assignees}
        priorities={kanban.priorities}
        issueTypes={kanban.issueTypes}
      />

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanban.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              isUpdating={kanban.isUpdating}
            />
          ))}

          {kanban.columns.length === 0 && (
            <div className="flex w-full items-center justify-center py-20 text-gray-400">
              No tasks found. Try adjusting your filters.
            </div>
          )}
        </div>

        <DragOverlay>
          {activeIssue && <TaskCard issue={activeIssue} isUpdating={false} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
