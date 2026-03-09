import { NextResponse } from "next/server";
import { getSprintDetails } from "@/lib/jira";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const { sprintId } = await params;
    const sprint = await getSprintDetails(sprintId);
    return NextResponse.json(sprint);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sprint" },
      { status: 500 }
    );
  }
}
