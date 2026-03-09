"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SprintIssue } from "@/types";
import { GripVertical, AlertTriangle, Bug, Bookmark, CheckSquare } from "lucide-react";

interface Props {
  issue: SprintIssue;
  isUpdating: boolean;
}

const priorityColors: Record<string, string> = {
  Highest: "text-red-600",
  High: "text-orange-500",
  Medium: "text-yellow-500",
  Low: "text-blue-500",
  Lowest: "text-gray-400",
};

const typeIcons: Record<string, typeof Bug> = {
  Bug: Bug,
  Story: Bookmark,
  Task: CheckSquare,
};

export default function TaskCard({ issue, isUpdating }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.key, data: { issue } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const TypeIcon = typeIcons[issue.issueType] || CheckSquare;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-50 shadow-lg" : ""
      } ${isUpdating ? "animate-pulse opacity-70" : ""} ${
        issue.blocked ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>

        <div className="min-w-0 flex-1">
          {/* Issue Key & Type */}
          <div className="mb-1 flex items-center gap-2">
            <TypeIcon className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-medium text-blue-600">
              {issue.key}
            </span>
            {issue.blocked && (
              <span className="flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                <AlertTriangle className="h-3 w-3" />
                Blocked
              </span>
            )}
          </div>

          {/* Summary */}
          <p className="text-sm text-gray-900 line-clamp-2">{issue.summary}</p>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Priority */}
              <span
                className={`text-xs font-medium ${priorityColors[issue.priority] || "text-gray-500"}`}
              >
                {issue.priority}
              </span>

              {/* Story Points */}
              {issue.storyPoints > 0 && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  {issue.storyPoints} SP
                </span>
              )}
            </div>

            {/* Assignee Avatar */}
            {issue.assignee && (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700"
                title={issue.assignee.displayName}
              >
                {issue.assignee.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
