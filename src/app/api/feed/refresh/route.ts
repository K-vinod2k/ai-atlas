import { NextResponse } from "next/server";
import {
  refreshFeed,
  getFeedItems,
  getNewsForNode,
  getTagsForNews,
} from "@/lib/feed/refresh";

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

export async function POST() {
  try {
    const result = await refreshFeed();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Refresh failed" },
      { status: 500 },
    );
  }
}
