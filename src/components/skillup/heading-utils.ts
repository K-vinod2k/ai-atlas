/** Shared between the chapter page (server) and the markdown renderer (client)
 * so table-of-contents anchors match rendered heading ids. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export interface TocEntry {
  id: string;
  text: string;
}

/** Extract h2 headings from a markdown body for the table of contents. */
export function extractToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^##\s+(.+)$/.exec(line);
    if (match) {
      const text = match[1].replace(/[*_`$]/g, "").trim();
      entries.push({ id: slugifyHeading(text), text });
    }
  }
  return entries;
}
