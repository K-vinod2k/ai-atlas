import type { Document } from "@langchain/core/documents";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { composeResponse } from "./compose";
import { parseQuery, type ParsedQuery } from "./entities";
import { GraphRetriever, type GraphDocMetadata } from "./graph-retriever";
import type { AgentMessage, AgentProvider, AgentResponse } from "./types";

interface GuideInput {
  messages: AgentMessage[];
}

interface ParsedState {
  parsed: ParsedQuery;
}

interface RetrievedState extends ParsedState {
  docs: Document<GraphDocMetadata>[];
}

const retriever = new GraphRetriever({ depth: 1, maxDocs: 8 });

/** Step 1: last user message -> intent + deterministically linked entities. */
const extractStep = RunnableLambda.from<GuideInput, ParsedState>((input) => {
  const last = [...input.messages].reverse().find((m) => m.role === "user");
  return { parsed: parseQuery(last?.content ?? "") };
});

/** Step 2: expand every linked entity into graph-context documents. */
const retrieveStep = RunnableLambda.from<ParsedState, RetrievedState>(
  async (state) => {
    const docs: Document<GraphDocMetadata>[] = [];
    const seen = new Set<string>();
    for (const entity of state.parsed.entities) {
      const query = entity.nodeId ?? entity.term;
      if (!query || seen.has(query)) continue;
      seen.add(query);
      const results = (await retriever.invoke(query)) as Document<GraphDocMetadata>[];
      docs.push(...results);
    }
    return { ...state, docs };
  },
);

/** Step 3 (default): template composition from graph content. No LLM needed. */
const templateComposeStep = RunnableLambda.from<RetrievedState, AgentResponse>(
  (state) => composeResponse(state.parsed),
);

const LLM_SYSTEM_PROMPT = [
  "You are the guide for AI Atlas, an interactive map of the AI landscape.",
  "Answer using ONLY the knowledge-graph context below. Be concise and factual.",
  "Mention how concepts sit in the hierarchy and what they connect to when relevant.",
  "Use markdown bold for node names. If the context does not cover the question, say so.",
].join(" ");

/** Step 3 (LLM slot): grounded composition over retrieved graph documents. */
function llmComposeStep(llm: BaseChatModel) {
  return RunnableLambda.from<RetrievedState, AgentResponse>(
    async (state) => {
      const template = composeResponse(state.parsed);
      if (state.docs.length === 0) return template;

      const context = state.docs
        .map((d) => `[${d.metadata.central ? "focus" : "context"}] ${d.pageContent}`)
        .join("\n\n---\n\n");
      try {
        const result = await llm.invoke([
          ["system", LLM_SYSTEM_PROMPT],
          ["human", `Knowledge graph context:\n\n${context}\n\nQuestion: ${state.parsed.raw}`],
        ]);
        const text =
          typeof result.content === "string"
            ? result.content
            : JSON.stringify(result.content);
        return { content: text, navigateTo: template.navigateTo };
      } catch {
        // LLM unavailable at request time: degrade to the template answer.
        return template;
      }
    },
  );
}

/**
 * The guide agent as a LangChain RunnableSequence:
 * query -> entity extraction -> graph retrieval -> response composition.
 */
export function createGuideChain(llm: BaseChatModel | null) {
  return RunnableSequence.from<GuideInput, AgentResponse>([
    extractStep,
    retrieveStep,
    llm ? llmComposeStep(llm) : templateComposeStep,
  ]);
}

/** AgentProvider adapter so the existing /api/agent route contract is unchanged. */
export class GraphGuideProvider implements AgentProvider {
  name: string;

  private readonly chain: ReturnType<typeof createGuideChain>;

  constructor(llm: BaseChatModel | null = null) {
    this.name = llm ? `kg-langchain:${llm.getName()}` : "kg-langchain";
    this.chain = createGuideChain(llm);
  }

  async chat(messages: AgentMessage[]): Promise<AgentResponse> {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") {
      return { content: "Send a message to get started." };
    }
    return this.chain.invoke({ messages });
  }
}
