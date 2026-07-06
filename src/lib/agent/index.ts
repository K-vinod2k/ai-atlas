import { GraphGuideProvider } from "./chain";
import { resolveChatModel } from "./llm";
import type { AgentProvider } from "./types";

let cachedProvider: AgentProvider | undefined;

/**
 * Returns the knowledge-graph guide agent. The default path is fully
 * offline (template composition over the KG). When AGENT_PROVIDER is
 * anthropic/openai/ollama and the matching key/package exists, a
 * LangChain chat model slots into the same chain for composition.
 */
export async function getAgentProvider(): Promise<AgentProvider> {
  if (cachedProvider) return cachedProvider;
  const llm = await resolveChatModel();
  cachedProvider = new GraphGuideProvider(llm);
  return cachedProvider;
}
