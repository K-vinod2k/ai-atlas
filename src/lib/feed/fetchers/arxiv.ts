import type { RawFeedItem } from "../tagger";

const ARXIV_CATEGORIES = ["cs.LG", "cs.CL", "cs.AI"];

export async function fetchArxiv(maxResults = 20): Promise<RawFeedItem[]> {
  const catQuery = ARXIV_CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
  const url = `https://export.arxiv.org/api/query?search_query=${catQuery}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`arXiv fetch failed: ${res.status}`);

  const xml = await res.text();
  const entries = xml.split("<entry>").slice(1);
  const items: RawFeedItem[] = [];

  for (const entry of entries) {
    const idMatch = entry.match(/<id>([^<]+)<\/id>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const summaryMatch = entry.match(/<summary>([^<]+)<\/summary>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    if (!idMatch || !titleMatch) continue;

    const arxivUrl = idMatch[1].trim();
    const arxivId = arxivUrl.split("/abs/")[1] ?? arxivUrl;

    items.push({
      id: `arxiv-${arxivId}`,
      title: titleMatch[1].replace(/\s+/g, " ").trim(),
      url: arxivUrl,
      source: "arXiv",
      summary: summaryMatch?.[1]?.replace(/\s+/g, " ").trim(),
      publishedAt: publishedMatch?.[1] ?? new Date().toISOString(),
    });
  }

  return items;
}
