import type { Sprint, SprintIssue, BurndownPoint, JiraTransition } from "@/types";
import { getDateRange } from "./utils";

function getAuthHeaders(): HeadersInit {
  const host = process.env.JIRA_HOST!;
  const email = process.env.JIRA_EMAIL!;
  const token = process.env.JIRA_API_TOKEN!;

  if (!host || !email || !token) {
    throw new Error("Jira credentials not configured. Check .env.local");
  }

  const auth = Buffer.from(`${email}:${token}`).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function getBaseUrl(): string {
  return process.env.JIRA_HOST!;
}

export async function getBoards(): Promise<
  { id: number; name: string; type: string }[]
> {
  const res = await fetch(`${getBaseUrl()}/rest/agile/1.0/board`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch boards: ${res.statusText}`);
  const data = await res.json();
  return data.values.map((b: Record<string, unknown>) => ({
    id: b.id,
    name: b.name,
    type: b.type,
  }));
}

export async function getSprints(boardId: string): Promise<Sprint[]> {
  const res = await fetch(
    `${getBaseUrl()}/rest/agile/1.0/board/${boardId}/sprint?state=active,closed&maxResults=20`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(`Failed to fetch sprints: ${res.statusText}`);
  const data = await res.json();

  return data.values.map(
    (s: Record<string, unknown>) =>
      ({
        id: s.id as number,
        name: s.name as string,
        state: s.state as Sprint["state"],
        startDate: s.startDate as string,
        endDate: s.endDate as string,
        completeDate: (s.completeDate as string) || undefined,
        goal: (s.goal as string) || undefined,
      }) satisfies Sprint
  );
}

export async function getSprintDetails(sprintId: string): Promise<Sprint> {
  const res = await fetch(
    `${getBaseUrl()}/rest/agile/1.0/sprint/${sprintId}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok)
    throw new Error(`Failed to fetch sprint details: ${res.statusText}`);
  const s = await res.json();

  return {
    id: s.id,
    name: s.name,
    state: s.state,
    startDate: s.startDate,
    endDate: s.endDate,
    completeDate: s.completeDate || undefined,
    goal: s.goal || undefined,
  };
}

export async function getSprintIssues(
  sprintId: string
): Promise<SprintIssue[]> {
  const fields =
    "summary,status,assignee,priority,issuetype,labels,created,updated,customfield_10016";
  let allIssues: SprintIssue[] = [];
  let startAt = 0;
  const maxResults = 50;

  while (true) {
    const res = await fetch(
      `${getBaseUrl()}/rest/agile/1.0/sprint/${sprintId}/issue?fields=${fields}&startAt=${startAt}&maxResults=${maxResults}`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok)
      throw new Error(`Failed to fetch sprint issues: ${res.statusText}`);
    const data = await res.json();

    const issues: SprintIssue[] = data.issues.map(
      (issue: Record<string, unknown>) => {
        const fields = issue.fields as Record<string, unknown>;
        const status = fields.status as Record<string, unknown>;
        const statusCategory = status.statusCategory as Record<string, unknown>;
        const assignee = fields.assignee as Record<string, unknown> | null;
        const priority = fields.priority as Record<string, unknown>;
        const issuetype = fields.issuetype as Record<string, unknown>;

        const categoryName = statusCategory.name as string;
        let mappedCategory: SprintIssue["statusCategory"];
        if (categoryName === "Done") mappedCategory = "Done";
        else if (categoryName === "In Progress") mappedCategory = "In Progress";
        else mappedCategory = "To Do";

        return {
          key: issue.key as string,
          summary: fields.summary as string,
          status: (status.name as string) || "Unknown",
          statusCategory: mappedCategory,
          assignee: assignee
            ? {
                displayName: assignee.displayName as string,
                avatarUrl: ((assignee.avatarUrls as Record<string, string>) || {})[
                  "24x24"
                ] || "",
              }
            : undefined,
          priority: (priority?.name as string) || "Medium",
          storyPoints: (fields.customfield_10016 as number) || 0,
          issueType: (issuetype?.name as string) || "Task",
          labels: (fields.labels as string[]) || [],
          blocked:
            (fields.labels as string[])?.some(
              (l: string) => l.toLowerCase() === "blocked"
            ) ||
            (status.name as string)?.toLowerCase().includes("block") ||
            false,
          created: fields.created as string,
          updated: fields.updated as string,
        } satisfies SprintIssue;
      }
    );

    allIssues = [...allIssues, ...issues];

    if (startAt + maxResults >= data.total) break;
    startAt += maxResults;
  }

  return allIssues;
}

export async function getBurndownData(
  sprintId: string
): Promise<BurndownPoint[]> {
  const sprint = await getSprintDetails(sprintId);
  const issues = await getSprintIssues(sprintId);

  const startDate = sprint.startDate.split("T")[0];
  const endDate = (sprint.completeDate || sprint.endDate).split("T")[0];
  const dates = getDateRange(startDate, endDate);

  const totalPoints = issues.reduce((sum, i) => sum + i.storyPoints, 0);
  const totalDays = dates.length - 1;
  const idealDecrement = totalDays > 0 ? totalPoints / totalDays : 0;

  // Fetch issues with changelog for accurate burndown
  const issuesWithChangelog = await fetchIssuesWithChangelog(
    issues.map((i) => i.key)
  );

  // Build a map of date -> points completed on that date
  const completionMap = new Map<string, number>();
  for (const issue of issuesWithChangelog) {
    const storyPoints =
      issues.find((i) => i.key === issue.key)?.storyPoints || 0;
    if (storyPoints === 0) continue;

    for (const history of issue.changelog) {
      for (const item of history.items) {
        if (
          item.field === "status" &&
          item.toString?.toLowerCase().includes("done")
        ) {
          const completedDate = history.created.split("T")[0];
          completionMap.set(
            completedDate,
            (completionMap.get(completedDate) || 0) + storyPoints
          );
        }
      }
    }
  }

  // Calculate burndown points
  let remainingPoints = totalPoints;
  return dates.map((date, index) => {
    const completedOnDate = completionMap.get(date) || 0;
    remainingPoints -= completedOnDate;

    return {
      date,
      ideal: Math.max(0, totalPoints - idealDecrement * index),
      actual: Math.max(0, remainingPoints),
    };
  });
}

async function fetchIssuesWithChangelog(
  issueKeys: string[]
): Promise<
  {
    key: string;
    changelog: {
      created: string;
      items: { field: string; toString: string | null }[];
    }[];
  }[]
> {
  const results = [];

  // Batch in groups of 10 to avoid rate limits
  for (let i = 0; i < issueKeys.length; i += 10) {
    const batch = issueKeys.slice(i, i + 10);
    const promises = batch.map(async (key) => {
      const res = await fetch(
        `${getBaseUrl()}/rest/api/3/issue/${key}?expand=changelog&fields=summary`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) return { key, changelog: [] };
      const data = await res.json();

      return {
        key,
        changelog: (data.changelog?.histories || []).map(
          (h: Record<string, unknown>) => ({
            created: h.created as string,
            items: (h.items as Record<string, unknown>[]).map(
              (item: Record<string, unknown>) => ({
                field: item.field as string,
                toString: (item as Record<string, string | null>)["toString"],
              })
            ),
          })
        ),
      };
    });

    results.push(...(await Promise.all(promises)));
  }

  return results;
}

export async function getIssueTransitions(
  issueKey: string
): Promise<JiraTransition[]> {
  const res = await fetch(
    `${getBaseUrl()}/rest/api/3/issue/${issueKey}/transitions`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok)
    throw new Error(`Failed to fetch transitions: ${res.statusText}`);
  const data = await res.json();
  return data.transitions;
}

export async function transitionIssue(
  issueKey: string,
  transitionId: string
): Promise<void> {
  const res = await fetch(
    `${getBaseUrl()}/rest/api/3/issue/${issueKey}/transitions`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ transition: { id: transitionId } }),
    }
  );
  if (!res.ok)
    throw new Error(`Failed to transition issue: ${res.statusText}`);
}

export async function createEpic(
  projectKey: string,
  title: string,
  description: string
): Promise<{ key: string; id: string }> {
  const res = await fetch(`${getBaseUrl()}/rest/api/3/issue`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: title,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: description }],
            },
          ],
        },
        issuetype: { name: "Epic" },
      },
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create epic: ${res.statusText} - ${JSON.stringify(errorData)}`
    );
  }
  const data = await res.json();
  return { key: data.key, id: data.id };
}

export async function createStory(
  projectKey: string,
  title: string,
  description: string,
  acceptanceCriteria: string,
  epicKey: string
): Promise<{ key: string; id: string }> {
  const fullDescription = `${description}\n\n*Acceptance Criteria:*\n${acceptanceCriteria}`;
  const res = await fetch(`${getBaseUrl()}/rest/api/3/issue`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: title,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: fullDescription }],
            },
          ],
        },
        issuetype: { name: "Story" },
        parent: { key: epicKey },
      },
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create story: ${res.statusText} - ${JSON.stringify(errorData)}`
    );
  }
  const data = await res.json();
  return { key: data.key, id: data.id };
}

export async function testConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const res = await fetch(`${getBaseUrl()}/rest/api/3/myself`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const user = await res.json();
      return {
        ok: true,
        message: `Connected as ${user.displayName} (${user.emailAddress})`,
      };
    }
    return { ok: false, message: `Connection failed: ${res.statusText}` };
  } catch (error) {
    return {
      ok: false,
      message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
