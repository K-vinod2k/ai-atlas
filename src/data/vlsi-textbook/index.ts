import type { TextbookChapter, TextbookPart, TextbookPartId } from "./types";
import { PART1_CHAPTERS } from "./part1-devices";
import { PART2_CHAPTERS } from "./part2-digital-design";
import { PART3_CHAPTERS } from "./part3-physical-design";
import { PART4_CHAPTERS } from "./part4-verification";
import { PART5_CHAPTERS } from "./part5-ai-vlsi";
import { CHAPTER_REFERENCES } from "./references";

export type {
  ChapterReference,
  TextbookChapter,
  TextbookPart,
  TextbookPartId,
} from "./types";

export const TEXTBOOK_PARTS: TextbookPart[] = [
  {
    id: "devices",
    number: 1,
    title: "Semiconductor & Device Basics",
    description:
      "From band gaps to the CMOS inverter: the physics and devices everything else is built on.",
  },
  {
    id: "digital-design",
    number: 2,
    title: "Digital Design",
    description:
      "Boolean logic, combinational and sequential circuits, timing, Verilog, and memory.",
  },
  {
    id: "physical-design",
    number: 3,
    title: "Physical Design & EDA Flow",
    description:
      "RTL-to-GDSII: synthesis, placement, clocks, routing, signoff, and low-power techniques.",
  },
  {
    id: "verification",
    number: 4,
    title: "Verification",
    description:
      "Testbenches, coverage, UVM architecture, and formal proofs of correctness.",
  },
  {
    id: "ai-vlsi",
    number: 5,
    title: "AI for VLSI / VLSI for AI",
    description:
      "ML inside the design flow, systolic-array accelerators, and memory hierarchies for AI chips.",
  },
];

export const TEXTBOOK_CHAPTERS: TextbookChapter[] = [
  ...PART1_CHAPTERS,
  ...PART2_CHAPTERS,
  ...PART3_CHAPTERS,
  ...PART4_CHAPTERS,
  ...PART5_CHAPTERS,
]
  .map((chapter) => ({
    ...chapter,
    references: CHAPTER_REFERENCES[chapter.slug],
  }))
  .sort((a, b) => a.order - b.order);

const BY_SLUG = new Map<string, TextbookChapter>(
  TEXTBOOK_CHAPTERS.map((c) => [c.slug, c]),
);

const PART_BY_ID = new Map<TextbookPartId, TextbookPart>(
  TEXTBOOK_PARTS.map((p) => [p.id, p]),
);

export function getChapters(): TextbookChapter[] {
  return TEXTBOOK_CHAPTERS;
}

export function getChapter(slug: string): TextbookChapter | undefined {
  return BY_SLUG.get(slug);
}

export function getChapterSlugs(): string[] {
  return TEXTBOOK_CHAPTERS.map((c) => c.slug);
}

export function getPart(id: TextbookPartId): TextbookPart {
  const part = PART_BY_ID.get(id);
  if (!part) throw new Error(`Unknown textbook part: ${id}`);
  return part;
}

/** Chapters grouped by part, in part order then chapter order. */
export function getChaptersByPart(): Array<{
  part: TextbookPart;
  chapters: TextbookChapter[];
}> {
  return TEXTBOOK_PARTS.map((part) => ({
    part,
    chapters: TEXTBOOK_CHAPTERS.filter((c) => c.part === part.id),
  }));
}

/** Prev/next chapter in global reading order. */
export function getChapterNeighbors(slug: string): {
  prev?: TextbookChapter;
  next?: TextbookChapter;
} {
  const index = TEXTBOOK_CHAPTERS.findIndex((c) => c.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? TEXTBOOK_CHAPTERS[index - 1] : undefined,
    next:
      index < TEXTBOOK_CHAPTERS.length - 1
        ? TEXTBOOK_CHAPTERS[index + 1]
        : undefined,
  };
}
