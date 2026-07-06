import type { RichContent } from "../types";
import { APPS_EXPLANATIONS } from "./apps";
import { ARCHITECTURE_EXPLANATIONS } from "./architectures";
import { DOMAIN_EXPLANATIONS } from "./domains";
import { FOUNDATION_EXPLANATIONS } from "./foundation";
import { PARADIGM_EXPLANATIONS } from "./paradigms";
import { STACK_EXPLANATIONS } from "./stack";

/** Authored textbook-style explanations keyed by taxonomy node id. */
export const EXPLANATIONS_BY_NODE_ID: Record<string, RichContent> = {
  ...PARADIGM_EXPLANATIONS,
  ...ARCHITECTURE_EXPLANATIONS,
  ...FOUNDATION_EXPLANATIONS,
  ...STACK_EXPLANATIONS,
  ...APPS_EXPLANATIONS,
  ...DOMAIN_EXPLANATIONS,
};
