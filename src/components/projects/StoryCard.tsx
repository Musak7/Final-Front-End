"use client";

import { cn } from "@/lib/utils";
import type { GeneratedStory } from "@/types";

interface StoryCardProps {
  story: GeneratedStory;
  onStatusChange?: (storyId: string, status: GeneratedStory["status"]) => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function StoryCard({ story, onStatusChange }: StoryCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{story.title}</h4>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                statusStyles[story.status]
              )}
            >
              {story.status}
            </span>
            {story.jiraKey && (
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {story.jiraKey}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">{story.description}</p>
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-500">
              Acceptance Criteria:
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {story.acceptanceCriteria}
            </p>
          </div>
        </div>

        {onStatusChange && story.status === "pending" && (
          <div className="flex gap-1.5">
            <button
              onClick={() => onStatusChange(story.id, "approved")}
              className="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              Approve
            </button>
            <button
              onClick={() => onStatusChange(story.id, "rejected")}
              className="rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
