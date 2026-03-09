import { NextResponse } from "next/server";
import { getBurndownData } from "@/lib/jira";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const { sprintId } = await params;
    const burndown = await getBurndownData(sprintId);
    return NextResponse.json(burndown);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch burndown data" },
      { status: 500 }
    );
  }
}
