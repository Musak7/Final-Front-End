import { NextResponse } from "next/server";
import { getSprints } from "@/lib/jira";

export async function GET() {
  try {
    const boardId = process.env.JIRA_BOARD_ID;
    if (!boardId) {
      return NextResponse.json(
        { error: "JIRA_BOARD_ID not configured" },
        { status: 500 }
      );
    }
    const sprints = await getSprints(boardId);
    return NextResponse.json(sprints);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sprints" },
      { status: 500 }
    );
  }
}
