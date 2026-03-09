export interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
  boardId: string;
}

export interface Sprint {
  id: number;
  name: string;
  state: "active" | "closed" | "future";
  startDate: string;
  endDate: string;
  completeDate?: string;
  goal?: string;
}

export interface SprintIssue {
  key: string;
  summary: string;
  status: string;
  statusCategory: "To Do" | "In Progress" | "Done";
  assignee?: {
    displayName: string;
    avatarUrl: string;
  };
  priority: string;
  storyPoints: number;
  issueType: string;
  labels: string[];
  blocked: boolean;
  created: string;
  updated: string;
}

export interface BurndownPoint {
  date: string;
  ideal: number;
  actual: number;
}

export interface HealthScore {
  score: number;
  level: "healthy" | "at-risk" | "critical";
  factors: {
    burndownDeviation: number;
    blockerCount: number;
    bugCount: number;
    scopeChange: number;
  };
}

export interface Alert {
  id: string;
  type: "blocker" | "scope-change" | "bug" | "risk";
  message: string;
  issueKey?: string;
  timestamp: string;
  dismissed: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  statusCategory: string;
  issues: SprintIssue[];
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
    statusCategory: {
      key: string;
    };
  };
}

// AI Requirements Generator Types

export interface Project {
  id: string;
  name: string;
  rawText: string;
  createdAt: string;
  status: "analyzing" | "epics-ready" | "stories-ready" | "verified" | "synced";
  epics: GeneratedEpic[];
}

export interface GeneratedEpic {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  stories: GeneratedStory[];
  jiraKey?: string;
}

export interface GeneratedStory {
  id: string;
  epicId: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  status: "pending" | "approved" | "rejected";
  jiraKey?: string;
}

export interface SprintReport {
  sprint: Sprint;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  totalIssues: number;
  completedIssues: number;
  healthScore: HealthScore;
  burndown: BurndownPoint[];
  issuesByType: Record<string, number>;
  issuesByPriority: Record<string, number>;
  issuesByAssignee: Record<string, number>;
}
