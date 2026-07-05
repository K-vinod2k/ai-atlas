import { NextResponse } from "next/server";
import { getTagsForNews } from "@/lib/feed/refresh";

interface RouteParams {
  params: Promise<{ newsId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { newsId } = await params;
    const tags = await getTagsForNews(newsId);
    return NextResponse.json({ nodeIds: tags.map((t) => t.nodeId) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load tags" },
      { status: 500 },
    );
  }
}
