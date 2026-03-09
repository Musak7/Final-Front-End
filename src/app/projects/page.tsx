"use client";

import { useProjects } from "@/hooks/useProjects";
import { useJira } from "@/context/JiraContext";
import { useSprintIssues, useBurndownData } from "@/hooks/useSprintData";
import { calculateHealthScore } from "@/lib/health-score";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, { label: string; color: string }> = {
  analyzing: { label: "Analyzing", color: "bg-yellow-100 text-yellow-800" },
  "epics-ready": { label: "Epics Ready", color: "bg-blue-100 text-blue-800" },
  "stories-ready": {
    label: "Stories Ready",
    color: "bg-purple-100 text-purple-800",
  },
  verified: { label: "Verified", color: "bg-green-100 text-green-800" },
  synced: { label: "Synced to Jira", color: "bg-emerald-100 text-emerald-800" },
};

const healthColors: Record<string, { bg: string; text: string; ring: string }> = {
  healthy: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-500" },
  "at-risk": { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-500" },
  critical: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-500" },
};

export default function ProjectsPage() {
  const { projects, isLoaded } = useProjects();
  const { activeSprint, selectedSprintId } = useJira();
  const { data: issues } = useSprintIssues(selectedSprintId);
  const { data: burndown } = useBurndownData(selectedSprintId);

  const totalPoints = issues?.reduce((s, i) => s + i.storyPoints, 0) || 0;
  const completedPoints =
    issues
      ?.filter((i) => i.statusCategory === "Done")
      .reduce((s, i) => s + i.storyPoints, 0) || 0;

  const health =
    burndown && issues
      ? calculateHealthScore(burndown, issues, totalPoints)
      : null;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered requirements generation from raw text
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No projects yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first project by pasting raw requirements text and let AI
            generate Epics &amp; User Stories.
          </p>
          <Link
            href="/projects/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const status = statusLabels[project.status] || {
              label: project.status,
              color: "bg-gray-100 text-gray-800",
            };
            const epicCount = project.epics.length;
            const storyCount = project.epics.reduce(
              (sum, e) => sum + e.stories.length,
              0
            );
            const approvedCount = project.epics.filter(
              (e) => e.status === "approved"
            ).length;
            const projectProgress =
              epicCount > 0
                ? Math.round((approvedCount / epicCount) * 100)
                : 0;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                        {project.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          status.color
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>{epicCount} epic{epicCount !== 1 ? "s" : ""}</span>
                      <span>{storyCount} stor{storyCount !== 1 ? "ies" : "y"}</span>
                      {activeSprint && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {activeSprint.name}
                        </span>
                      )}
                      <span>
                        Created{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {health && (
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          healthColors[health.level]?.bg,
                          healthColors[health.level]?.text
                        )}
                      >
                        {health.score}%
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                </div>

                {/* Project Health Bar */}
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>
                      {approvedCount}/{epicCount} epics approved
                    </span>
                    <span>{projectProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        projectProgress === 100
                          ? "bg-green-500"
                          : projectProgress > 0
                            ? "bg-blue-500"
                            : "bg-gray-300"
                      )}
                      style={{ width: `${projectProgress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
