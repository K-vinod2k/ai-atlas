import type { AgentProvider } from "./types";
import { LocalGuideProvider } from "./local-guide";

class AnthropicProvider implements AgentProvider {
  name = "anthropic";

  async chat(): Promise<never> {
    throw new Error(
      "Anthropic provider requires ANTHROPIC_API_KEY. Set AGENT_PROVIDER=local to use the offline guide.",
    );
  }
}

class OpenAIProvider implements AgentProvider {
  name = "openai";

  async chat(): Promise<never> {
    throw new Error(
      "OpenAI provider requires OPENAI_API_KEY. Set AGENT_PROVIDER=local to use the offline guide.",
    );
  }
}

export function getAgentProvider(): AgentProvider {
  const provider = process.env.AGENT_PROVIDER ?? "local";

  switch (provider) {
    case "anthropic":
      if (!process.env.ANTHROPIC_API_KEY) return new LocalGuideProvider();
      return new AnthropicProvider();
    case "openai":
      if (!process.env.OPENAI_API_KEY) return new LocalGuideProvider();
      return new OpenAIProvider();
    default:
      return new LocalGuideProvider();
  }
}
