/** Types for the VLSI textbook inside Skillup. Kept local to avoid
 * touching the shared types.ts while another track edits it. */

export type TextbookPartId =
  | "devices"
  | "digital-design"
  | "physical-design"
  | "verification"
  | "ai-vlsi";

export interface TextbookPart {
  id: TextbookPartId;
  number: number;
  title: string;
  description: string;
}

export interface TextbookChapter {
  slug: string;
  title: string;
  part: TextbookPartId;
  /** Global reading order across the whole book. */
  order: number;
  summary: string;
  /** Approximate reading time in minutes. */
  minutes: number;
  /** Taxonomy node ids this chapter relates to. */
  relatedNodeIds?: string[];
  /** Markdown body. Supports GFM, $...$ / $$...$$ math, and ```mermaid blocks. */
  body: string;
}
