"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, GeneratedEpic, GeneratedStory } from "@/types";

const STORAGE_KEY = "focus-flow-projects";

function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setIsLoaded(true);
  }, []);

  const persist = useCallback((updated: Project[]) => {
    setProjects(updated);
    saveProjects(updated);
  }, []);

  const addProject = useCallback(
    (project: Project) => {
      persist([project, ...projects]);
    },
    [projects, persist]
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id) || null,
    [projects]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      const updated = projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      persist(updated);
    },
    [projects, persist]
  );

  const setEpics = useCallback(
    (projectId: string, epics: GeneratedEpic[]) => {
      const updated = projects.map((p) =>
        p.id === projectId ? { ...p, epics, status: "epics-ready" as const } : p
      );
      persist(updated);
    },
    [projects, persist]
  );

  const addStoriesToEpic = useCallback(
    (projectId: string, epicId: string, stories: GeneratedStory[]) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedEpics = p.epics.map((e) =>
          e.id === epicId ? { ...e, stories } : e
        );
        const allHaveStories = updatedEpics.every((e) => e.stories.length > 0);
        return {
          ...p,
          epics: updatedEpics,
          status: allHaveStories ? ("stories-ready" as const) : p.status,
        };
      });
      persist(updated);
    },
    [projects, persist]
  );

  const updateEpicStatus = useCallback(
    (projectId: string, epicId: string, status: GeneratedEpic["status"]) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          epics: p.epics.map((e) => (e.id === epicId ? { ...e, status } : e)),
        };
      });
      persist(updated);
    },
    [projects, persist]
  );

  const updateStoryStatus = useCallback(
    (
      projectId: string,
      epicId: string,
      storyId: string,
      status: GeneratedStory["status"]
    ) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          epics: p.epics.map((e) =>
            e.id === epicId
              ? {
                  ...e,
                  stories: e.stories.map((s) =>
                    s.id === storyId ? { ...s, status } : s
                  ),
                }
              : e
          ),
        };
      });
      persist(updated);
    },
    [projects, persist]
  );

  const updateEpic = useCallback(
    (projectId: string, epicId: string, updates: Partial<GeneratedEpic>) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          epics: p.epics.map((e) =>
            e.id === epicId ? { ...e, ...updates } : e
          ),
        };
      });
      persist(updated);
    },
    [projects, persist]
  );

  const updateStory = useCallback(
    (
      projectId: string,
      epicId: string,
      storyId: string,
      updates: Partial<GeneratedStory>
    ) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          epics: p.epics.map((e) =>
            e.id === epicId
              ? {
                  ...e,
                  stories: e.stories.map((s) =>
                    s.id === storyId ? { ...s, ...updates } : s
                  ),
                }
              : e
          ),
        };
      });
      persist(updated);
    },
    [projects, persist]
  );

  const bulkUpdateStatus = useCallback(
    (projectId: string, status: "approved" | "rejected") => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          epics: p.epics.map((e) => ({
            ...e,
            status,
            stories: e.stories.map((s) => ({ ...s, status })),
          })),
        };
      });
      persist(updated);
    },
    [projects, persist]
  );

  return {
    projects,
    isLoaded,
    addProject,
    getProject,
    updateProject,
    setEpics,
    addStoriesToEpic,
    updateEpicStatus,
    updateStoryStatus,
    updateEpic,
    updateStory,
    bulkUpdateStatus,
  };
}
