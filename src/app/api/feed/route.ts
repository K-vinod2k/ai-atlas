import { NextResponse } from "next/server";
import { getFeedItems } from "@/lib/feed/refresh";

export async function GET() {
  try {
    const items = await getFeedItems(50);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load feed" },
      { status: 500 },
    );
  }
}
