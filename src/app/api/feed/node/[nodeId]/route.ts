import { NextResponse } from "next/server";
import { getNewsForNode } from "@/lib/feed/refresh";

interface RouteParams {
  params: Promise<{ nodeId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { nodeId } = await params;
    const items = await getNewsForNode(nodeId, 10);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load node news" },
      { status: 500 },
    );
  }
}
