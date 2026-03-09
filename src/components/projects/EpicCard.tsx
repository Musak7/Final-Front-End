"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedEpic, GeneratedStory } from "@/types";
import StoryCard from "./StoryCard";

interface EpicCardProps {
  epic: GeneratedEpic;
  onGenerateStories: (epicId: string) => Promise<void>;
  onStoryStatusChange?: (storyId: string, status: GeneratedStory["status"]) => void;
  onEpicStatusChange?: (epicId: string, status: GeneratedEpic["status"]) => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function EpicCard({
  epic,
  onGenerateStories,
  onStoryStatusChange,
  onEpicStatusChange,
}: EpicCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateStories(epic.id);
      setExpanded(true);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Epic Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {epic.title}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  statusStyles[epic.status]
                )}
              >
                {epic.status}
              </span>
              {epic.jiraKey && (
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {epic.jiraKey}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {epic.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {epic.stories.length === 0 && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-purple-700 disabled:bg-gray-300"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Stories
                </>
              )}
            </button>
          )}
          {epic.stories.length > 0 && (
            <span className="text-xs text-gray-400">
              {epic.stories.length} stories
            </span>
          )}
          {onEpicStatusChange && epic.status !== "approved" && (
            <button
              onClick={() => onEpicStatusChange(epic.id, "approved")}
              className="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              Approve Epic
            </button>
          )}
          {onEpicStatusChange && epic.status !== "rejected" && (
            <button
              onClick={() => onEpicStatusChange(epic.id, "rejected")}
              className="rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              Reject Epic
            </button>
          )}
        </div>
      </div>

      {/* Stories */}
      {expanded && epic.stories.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <div className="space-y-3">
            {epic.stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onStatusChange={onStoryStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
