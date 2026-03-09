import { NextResponse } from "next/server";
import { getSprintIssues } from "@/lib/jira";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const { sprintId } = await params;
    const issues = await getSprintIssues(sprintId);
    return NextResponse.json(issues);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
