import { NextResponse } from "next/server";
import { testConnection } from "@/lib/jira";

export async function GET() {
  const result = await testConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
