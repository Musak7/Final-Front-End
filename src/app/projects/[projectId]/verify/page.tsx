"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
  CheckCheck,
  XOctagon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import EditModal from "@/components/projects/EditModal";
import SyncButton from "@/components/projects/SyncButton";
import type { GeneratedEpic, GeneratedStory } from "@/types";

export default function VerifyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const {
    getProject,
    updateEpicStatus,
    updateStoryStatus,
    updateEpic,
    updateStory,
    bulkUpdateStatus,
    updateProject,
    isLoaded,
  } = useProjects();
  const router = useRouter();

  const [editModal, setEditModal] = useState<{
    type: "epic" | "story";
    epicId: string;
    storyId?: string;
    title: string;
    description: string;
    acceptanceCriteria?: string;
  } | null>(null);

  const project = getProject(projectId);

  useEffect(() => {
    if (isLoaded && !project) {
      router.push("/projects");
    }
  }, [isLoaded, project, router]);

  if (!isLoaded || !project) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Count stats
  const allItems: { type: string; status: string }[] = [];
  project.epics.forEach((e) => {
    allItems.push({ type: "epic", status: e.status });
    e.stories.forEach((s) => {
      allItems.push({ type: "story", status: s.status });
    });
  });

  const approved = allItems.filter((i) => i.status === "approved").length;
  const pending = allItems.filter((i) => i.status === "pending").length;
  const rejected = allItems.filter((i) => i.status === "rejected").length;
  const total = allItems.length;

  const handleEditSave = (data: {
    title: string;
    description: string;
    acceptanceCriteria?: string;
  }) => {
    if (!editModal) return;

    if (editModal.type === "epic") {
      updateEpic(projectId, editModal.epicId, {
        title: data.title,
        description: data.description,
      });
    } else if (editModal.storyId) {
      updateStory(projectId, editModal.epicId, editModal.storyId, {
        title: data.title,
        description: data.description,
        acceptanceCriteria: data.acceptanceCriteria,
      });
    }
  };

  const handleSyncComplete = (
    results: {
      epicId: string;
      epicKey: string;
      stories: { storyId: string; storyKey: string }[];
    }[]
  ) => {
    // Update local state with Jira keys
    for (const result of results) {
      updateEpic(projectId, result.epicId, { jiraKey: result.epicKey });
      for (const story of result.stories) {
        updateStory(projectId, result.epicId, story.storyId, {
          jiraKey: story.storyKey,
        });
      }
    }
    updateProject(projectId, { status: "synced" });
  };

  const statusIcon = (status: string) => {
    if (status === "approved")
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "rejected")
      return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Review &amp; Verify
        </h1>
        <p className="mt-1 text-sm text-gray-500">{project.name}</p>
      </div>

      {/* Summary Bar */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Total Items</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{approved}</p>
          <p className="text-xs text-green-600">Approved</p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{pending}</p>
          <p className="text-xs text-yellow-600">Pending</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{rejected}</p>
          <p className="text-xs text-red-600">Rejected</p>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => bulkUpdateStatus(projectId, "approved")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Approve All
        </button>
        <button
          onClick={() => bulkUpdateStatus(projectId, "rejected")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          <XOctagon className="h-3.5 w-3.5" />
          Reject All
        </button>
      </div>

      {/* Epics & Stories List */}
      <div className="space-y-4">
        {project.epics.map((epic) => (
          <div
            key={epic.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {/* Epic Row */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                {statusIcon(epic.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase text-purple-600">
                      Epic
                    </span>
                    <h3 className="font-semibold text-gray-900">
                      {epic.title}
                    </h3>
                    {epic.jiraKey && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {epic.jiraKey}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
                    {epic.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setEditModal({
                      type: "epic",
                      epicId: epic.id,
                      title: epic.title,
                      description: epic.description,
                    })
                  }
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {epic.status !== "approved" && (
                  <button
                    onClick={() =>
                      updateEpicStatus(projectId, epic.id, "approved")
                    }
                    className="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    Approve
                  </button>
                )}
                {epic.status !== "rejected" && (
                  <button
                    onClick={() =>
                      updateEpicStatus(projectId, epic.id, "rejected")
                    }
                    className="rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>

            {/* Stories */}
            <div className="divide-y divide-gray-50">
              {epic.stories.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between px-5 py-3 pl-12"
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(story.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase text-blue-600">
                          Story
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {story.title}
                        </span>
                        {story.jiraKey && (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {story.jiraKey}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                        {story.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setEditModal({
                          type: "story",
                          epicId: epic.id,
                          storyId: story.id,
                          title: story.title,
                          description: story.description,
                          acceptanceCriteria: story.acceptanceCriteria,
                        })
                      }
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {story.status !== "approved" && (
                      <button
                        onClick={() =>
                          updateStoryStatus(
                            projectId,
                            epic.id,
                            story.id,
                            "approved"
                          )
                        }
                        className="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        Approve
                      </button>
                    )}
                    {story.status !== "rejected" && (
                      <button
                        onClick={() =>
                          updateStoryStatus(
                            projectId,
                            epic.id,
                            story.id,
                            "rejected"
                          )
                        }
                        className="rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Jira Sync */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Sync to Jira
        </h2>
        <SyncButton
          epics={project.epics}
          onSyncComplete={handleSyncComplete}
        />
      </div>

      {/* Edit Modal */}
      {editModal && (
        <EditModal
          type={editModal.type}
          title={editModal.title}
          description={editModal.description}
          acceptanceCriteria={editModal.acceptanceCriteria}
          onSave={handleEditSave}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}
