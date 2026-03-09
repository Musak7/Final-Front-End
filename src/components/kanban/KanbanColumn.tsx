"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { KanbanColumn as ColumnType } from "@/types";
import TaskCard from "./TaskCard";

interface Props {
  column: ColumnType;
  isUpdating: string | null;
}

const categoryColors: Record<string, { bg: string; badge: string }> = {
  "To Do": { bg: "border-t-gray-400", badge: "bg-gray-100 text-gray-600" },
  "In Progress": { bg: "border-t-blue-500", badge: "bg-blue-100 text-blue-600" },
  Done: { bg: "border-t-green-500", badge: "bg-green-100 text-green-600" },
};

export default function KanbanColumn({ column, isUpdating }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const colors = categoryColors[column.statusCategory] || categoryColors["To Do"];
  const totalPoints = column.issues.reduce((sum, i) => sum + i.storyPoints, 0);

  return (
    <div
      className={`flex min-w-[280px] flex-col rounded-xl border border-gray-200 bg-gray-50 border-t-4 ${colors.bg} ${
        isOver ? "ring-2 ring-blue-300" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">
            {column.title}
          </h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}>
            {column.issues.length}
          </span>
        </div>
        {totalPoints > 0 && (
          <span className="text-xs text-gray-400">{totalPoints} SP</span>
        )}
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 overflow-y-auto p-2 pt-0"
        style={{ minHeight: "100px" }}
      >
        <SortableContext
          items={column.issues.map((i) => i.key)}
          strategy={verticalListSortingStrategy}
        >
          {column.issues.map((issue) => (
            <TaskCard
              key={issue.key}
              issue={issue}
              isUpdating={isUpdating === issue.key}
            />
          ))}
        </SortableContext>

        {column.issues.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
