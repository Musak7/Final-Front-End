import { NextResponse } from "next/server";
import { getIssueTransitions, transitionIssue } from "@/lib/jira";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  try {
    const { issueKey } = await params;
    const transitions = await getIssueTransitions(issueKey);
    return NextResponse.json(transitions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transitions" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  try {
    const { issueKey } = await params;
    const { transitionId } = await request.json();
    await transitionIssue(issueKey, transitionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update issue" },
      { status: 500 }
    );
  }
}
