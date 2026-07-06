import { SKILLUP_ITEMS } from "./skillup-content";
import type { SkillupItem } from "./types";

const BY_SLUG = new Map<string, SkillupItem>(
  SKILLUP_ITEMS.map((item) => [item.slug, item]),
);

const BY_NODE_ID = new Map<string, SkillupItem[]>();
for (const item of SKILLUP_ITEMS) {
  for (const nodeId of item.relatedNodeIds ?? []) {
    const list = BY_NODE_ID.get(nodeId) ?? [];
    list.push(item);
    BY_NODE_ID.set(nodeId, list);
  }
}

export function getSkillupItems(): SkillupItem[] {
  return [...SKILLUP_ITEMS].sort((a, b) => a.order - b.order);
}

export function getSkillupItem(slug: string): SkillupItem | undefined {
  return BY_SLUG.get(slug);
}

export function getSkillupSlugs(): string[] {
  return SKILLUP_ITEMS.map((item) => item.slug);
}

/** Items grouped by topic, preserving order within each group. */
export function getSkillupByTopic(): Array<{
  topic: string;
  items: SkillupItem[];
}> {
  const groups = new Map<string, SkillupItem[]>();
  for (const item of getSkillupItems()) {
    const list = groups.get(item.topic) ?? [];
    list.push(item);
    groups.set(item.topic, list);
  }
  return Array.from(groups.entries()).map(([topic, items]) => ({
    topic,
    items,
  }));
}

/** Skillup items that reference a given taxonomy node. */
export function getSkillupForNode(nodeId: string): SkillupItem[] {
  return BY_NODE_ID.get(nodeId) ?? [];
}
