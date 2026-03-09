import { NextResponse } from "next/server";
import { getBoards } from "@/lib/jira";

export async function GET() {
  try {
    const boards = await getBoards();
    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
