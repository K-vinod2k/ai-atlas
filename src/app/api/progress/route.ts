import { NextResponse } from "next/server";
import { getNodeById } from "@/data/taxonomy";
import { isProgressStatus } from "@/data/types";
import { getProgressSnapshot, recordProgress } from "@/lib/progress/store";

export async function GET() {
  try {
    return NextResponse.json(getProgressSnapshot());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load progress" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const { nodeId, status } = (body ?? {}) as {
      nodeId?: unknown;
      status?: unknown;
    };

    if (typeof nodeId !== "string" || !getNodeById(nodeId)) {
      return NextResponse.json(
        { error: "Unknown taxonomy node" },
        { status: 400 },
      );
    }
    if (typeof status !== "string" || !isProgressStatus(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 },
      );
    }

    recordProgress(nodeId, status);
    return NextResponse.json(getProgressSnapshot());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save progress" },
      { status: 500 },
    );
  }
}
