import { NextResponse } from "next/server";
import { getAgentProvider } from "@/lib/agent";
import type { AgentMessage } from "@/lib/agent/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages: AgentMessage[] };
    if (!body.messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const provider = getAgentProvider();
    const response = await provider.chat(body.messages);
    return NextResponse.json({
      content: response.content,
      navigateTo: response.navigateTo,
      provider: provider.name,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent error" },
      { status: 500 },
    );
  }
}
