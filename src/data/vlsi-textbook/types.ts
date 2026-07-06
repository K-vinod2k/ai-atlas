/** Types for the VLSI textbook inside Skillup. Kept local to avoid
 * touching the shared types.ts while another track edits it. */

import type { ReferenceBookId } from "../reference-books";

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

/** A pointer from an app chapter into one of the user's reference books. */
export interface ChapterReference {
  bookId: ReferenceBookId;
  /** Human-readable chapter(s) within the book, e.g. "Ch. 5" or "Ch. 2–3". */
  chapters: string;
  /** Why this reading matters for the app chapter. */
  note: string;
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
  /** Further reading in the user's reference bookshelf. */
  references?: ChapterReference[];
  /** Markdown body. Supports GFM, $...$ / $$...$$ math, and ```mermaid blocks. */
  body: string;
}
