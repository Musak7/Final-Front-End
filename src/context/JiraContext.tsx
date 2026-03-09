"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Sprint } from "@/types";
import { useSprints } from "@/hooks/useSprintData";

interface JiraContextType {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  selectedSprintId: number | null;
  setSelectedSprintId: (id: number | null) => void;
  isLoading: boolean;
  error: string | null;
}

const JiraContext = createContext<JiraContextType>({
  sprints: [],
  activeSprint: null,
  selectedSprintId: null,
  setSelectedSprintId: () => {},
  isLoading: true,
  error: null,
});

export function JiraProvider({ children }: { children: ReactNode }) {
  const { data: sprints, error, isLoading } = useSprints();
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

  const activeSprint = sprints?.find((s) => s.state === "active") || null;

  // Auto-select active sprint on load
  useEffect(() => {
    if (sprints && !selectedSprintId) {
      const active = sprints.find((s) => s.state === "active");
      if (active) setSelectedSprintId(active.id);
      else if (sprints.length > 0) setSelectedSprintId(sprints[0].id);
    }
  }, [sprints, selectedSprintId]);

  return (
    <JiraContext.Provider
      value={{
        sprints: sprints || [],
        activeSprint,
        selectedSprintId,
        setSelectedSprintId,
        isLoading,
        error: error ? "Failed to load sprints" : null,
      }}
    >
      {children}
    </JiraContext.Provider>
  );
}

export function useJira() {
  return useContext(JiraContext);
}
