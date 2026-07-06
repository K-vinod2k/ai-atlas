import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

interface ProviderSpec {
  module: string;
  className: string;
  /** Env var holding the API key; null means no key required (local runtime). */
  envKey: string | null;
  modelEnv: string;
  defaultModel: string;
}

const PROVIDERS: Record<string, ProviderSpec> = {
  anthropic: {
    module: "@langchain/anthropic",
    className: "ChatAnthropic",
    envKey: "ANTHROPIC_API_KEY",
    modelEnv: "AGENT_LLM_MODEL",
    defaultModel: "claude-sonnet-4-5",
  },
  openai: {
    module: "@langchain/openai",
    className: "ChatOpenAI",
    envKey: "OPENAI_API_KEY",
    modelEnv: "AGENT_LLM_MODEL",
    defaultModel: "gpt-4o-mini",
  },
  ollama: {
    module: "@langchain/ollama",
    className: "ChatOllama",
    envKey: null,
    modelEnv: "AGENT_LLM_MODEL",
    defaultModel: "llama3.1",
  },
};

type ChatModelCtor = new (fields: Record<string, unknown>) => BaseChatModel;

/* Bypass webpack static analysis: provider packages are optional peer deps
   loaded at runtime only when the matching env vars are set. */
const dynamicImport = new Function("m", "return import(m)") as (
  m: string,
) => Promise<Record<string, unknown>>;

let cached: { model: BaseChatModel | null } | undefined;

/**
 * Resolve an optional chat model from env config (AGENT_PROVIDER +
 * provider API key). Returns null when unconfigured or the provider
 * package is not installed — callers fall back to template composition.
 */
export async function resolveChatModel(): Promise<BaseChatModel | null> {
  if (cached) return cached.model;

  const providerName = process.env.AGENT_PROVIDER ?? "local";
  const spec = PROVIDERS[providerName];
  if (!spec || (spec.envKey && !process.env[spec.envKey])) {
    cached = { model: null };
    return null;
  }

  try {
    const mod = await dynamicImport(spec.module);
    const Ctor = mod[spec.className] as ChatModelCtor | undefined;
    if (!Ctor) throw new Error(`${spec.className} not exported by ${spec.module}`);
    const model = new Ctor({
      model: process.env[spec.modelEnv] ?? spec.defaultModel,
      temperature: 0.2,
    });
    cached = { model };
    return model;
  } catch {
    cached = { model: null };
    return null;
  }
}
