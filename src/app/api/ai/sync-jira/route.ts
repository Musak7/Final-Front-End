import { NextResponse } from "next/server";
import { createEpic, createStory } from "@/lib/jira";
import type { GeneratedEpic } from "@/types";

export async function POST(request: Request) {
  try {
    const { projectKey, epics } = (await request.json()) as {
      projectKey: string;
      epics: GeneratedEpic[];
    };

    if (!projectKey || !epics?.length) {
      return NextResponse.json(
        { error: "Project key and epics are required" },
        { status: 400 }
      );
    }

    const results: {
      epicId: string;
      epicKey: string;
      stories: { storyId: string; storyKey: string }[];
    }[] = [];

    for (const epic of epics) {
      if (epic.status !== "approved") continue;

      // Create the Epic in Jira
      const createdEpic = await createEpic(
        projectKey,
        epic.title,
        epic.description
      );

      const storyResults: { storyId: string; storyKey: string }[] = [];

      // Create Stories linked to the Epic
      for (const story of epic.stories) {
        if (story.status !== "approved") continue;

        const createdStory = await createStory(
          projectKey,
          story.title,
          story.description,
          story.acceptanceCriteria,
          createdEpic.key
        );

        storyResults.push({
          storyId: story.id,
          storyKey: createdStory.key,
        });
      }

      results.push({
        epicId: epic.id,
        epicKey: createdEpic.key,
        stories: storyResults,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Jira sync failed",
      },
      { status: 500 }
    );
  }
}
