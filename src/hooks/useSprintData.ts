"use client";

import useSWR from "swr";
import type { Sprint, SprintIssue, BurndownPoint } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

export function useSprints() {
  return useSWR<Sprint[]>("/api/jira/sprints", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useSprintDetails(sprintId: number | null) {
  return useSWR<Sprint>(
    sprintId ? `/api/jira/sprint/${sprintId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
}

export function useSprintIssues(sprintId: number | null) {
  return useSWR<SprintIssue[]>(
    sprintId ? `/api/jira/sprint/${sprintId}/issues` : null,
    fetcher,
    { refreshInterval: 30000 }
  );
}

export function useBurndownData(sprintId: number | null) {
  return useSWR<BurndownPoint[]>(
    sprintId ? `/api/jira/sprint/${sprintId}/burndown` : null,
    fetcher,
    { refreshInterval: 60000 }
  );
}
