"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { ArrowLeft, ClipboardCheck, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import EpicCard from "@/components/projects/EpicCard";
import type { GeneratedStory } from "@/types";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { getProject, addStoriesToEpic, updateStoryStatus, isLoaded } =
    useProjects();
  const router = useRouter();
  const [generatingAll, setGeneratingAll] = useState(false);

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

  const handleGenerateStories = async (epicId: string) => {
    const epic = project.epics.find((e) => e.id === epicId);
    if (!epic) return;

    const res = await fetch("/api/ai/generate-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        epicId: epic.id,
        epicTitle: epic.title,
        epicDescription: epic.description,
      }),
    });

    if (!res.ok) throw new Error("Story generation failed");
    const { stories } = await res.json();
    addStoriesToEpic(projectId, epicId, stories);
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    try {
      for (const epic of project.epics) {
        if (epic.stories.length === 0) {
          await handleGenerateStories(epic.id);
        }
      }
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleStoryStatusChange = (
    epicId: string,
    storyId: string,
    status: GeneratedStory["status"]
  ) => {
    updateStoryStatus(projectId, epicId, storyId, status);
  };

  const allEpicsHaveStories = project.epics.every(
    (e) => e.stories.length > 0
  );
  const epicsWithoutStories = project.epics.filter(
    (e) => e.stories.length === 0
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {project.epics.length} epics generated &middot;{" "}
            {project.epics.reduce((s, e) => s + e.stories.length, 0)} stories
          </p>
        </div>
        <div className="flex gap-3">
          {epicsWithoutStories.length > 0 && (
            <button
              onClick={handleGenerateAll}
              disabled={generatingAll}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700 disabled:bg-gray-300"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating All...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate All Stories
                </>
              )}
            </button>
          )}
          {allEpicsHaveStories && (
            <Link
              href={`/projects/${projectId}/verify`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <ClipboardCheck className="h-4 w-4" />
              Proceed to Review
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {project.epics.map((epic) => (
          <EpicCard
            key={epic.id}
            epic={epic}
            onGenerateStories={handleGenerateStories}
            onStoryStatusChange={(storyId, status) =>
              handleStoryStatusChange(epic.id, storyId, status)
            }
          />
        ))}
      </div>
    </div>
  );
}
