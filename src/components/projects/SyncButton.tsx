"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { GeneratedEpic } from "@/types";

interface SyncButtonProps {
  epics: GeneratedEpic[];
  onSyncComplete: (
    results: {
      epicId: string;
      epicKey: string;
      stories: { storyId: string; storyKey: string }[];
    }[]
  ) => void;
}

export default function SyncButton({ epics, onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const approvedEpics = epics.filter((e) => e.status === "approved");
  const approvedCount = approvedEpics.length;
  const approvedStoryCount = approvedEpics.reduce(
    (sum, e) => sum + e.stories.filter((s) => s.status === "approved").length,
    0
  );

  const canSync = approvedCount >= 2;

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/ai/sync-jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectKey: "SCRUM",
          epics: approvedEpics,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sync failed");
      }

      const { results } = await res.json();
      onSyncComplete(results);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleSync}
        disabled={!canSync || syncing || success}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {syncing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing to Jira...
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Synced Successfully
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Sync to Jira ({approvedCount} epics, {approvedStoryCount} stories)
          </>
        )}
      </button>

      {!canSync && !success && (
        <p className="text-center text-xs text-gray-500">
          Approve at least 2 epics to enable Jira sync
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <p className="text-center text-xs text-green-600">
          All approved items have been created in Jira
        </p>
      )}
    </div>
  );
}
