import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  ExternalLink,
  Library,
  Link2,
  List,
} from "lucide-react";
import { LearnShell } from "@/components/layout/LearnShell";
import { ChapterBody } from "@/components/skillup/ChapterBody";
import { extractToc } from "@/components/skillup/heading-utils";
import {
  getChapter,
  getChapterNeighbors,
  getChapterSlugs,
  getPart,
} from "@/data/vlsi-textbook";
import { getNodeById } from "@/data/taxonomy";
import { getReferenceBook } from "@/data/reference-books";

interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getChapterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);
  return {
    title: chapter
      ? `${chapter.title} — VLSI Textbook — AI Atlas`
      : "VLSI Textbook — AI Atlas",
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const part = getPart(chapter.part);
  const { prev, next } = getChapterNeighbors(slug);
  const toc = extractToc(chapter.body);

  const relatedNodes = (chapter.relatedNodeIds ?? [])
    .map((id) => getNodeById(id)?.node)
    .filter((n): n is NonNullable<typeof n> => n !== undefined);

  const references = (chapter.references ?? []).map((ref) => ({
    ...ref,
    book: getReferenceBook(ref.bookId),
  }));

  return (
    <LearnShell>
      <div className="mx-auto max-w-3xl px-5 lg:px-8 py-10 space-y-8">
        <Link
          href="/skillup"
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-muted-foreground)] hover:text-[#7FA3C0] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Skillup library
        </Link>

        <header className="space-y-4 pb-6 border-b border-[rgba(138,122,109,0.32)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-primary">
              <BookOpen className="w-3 h-3 mr-1" aria-hidden="true" />
              Chapter {chapter.order}
            </span>
            <span className="badge">
              Part {part.number}: {part.title}
            </span>
            <span className="badge badge-highlight">
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              {chapter.minutes} min
            </span>
          </div>
          <h1 className="heading-display text-3xl lg:text-4xl font-semibold leading-tight">
            {chapter.title}
          </h1>
          <p className="text-[color:var(--color-muted-foreground)] leading-relaxed">
            {chapter.summary}
          </p>
        </header>

        {toc.length >= 4 && (
          <nav className="card" aria-label="Table of contents">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
              <h2 className="section-label">In this chapter</h2>
            </div>
            <ol className="space-y-1.5 text-sm">
              {toc.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="text-[color:var(--color-muted-foreground)] hover:text-[#7FA3C0] transition-colors duration-200"
                  >
                    {entry.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article>
          <ChapterBody body={chapter.body} />
        </article>

        {relatedNodes.length > 0 && (
          <section className="card">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-[#E8D5C4]" aria-hidden="true" />
              <h2 className="section-label">Related concepts in the Atlas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedNodes.map((node) => (
                <Link
                  key={node.id}
                  href={`/learn?node=${node.id}`}
                  className="link-pill"
                >
                  {node.name}
                  <ArrowRight className="w-3 h-3 ml-1.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {references.length > 0 && (
          <section className="card">
            <div className="flex items-center gap-2 mb-1">
              <Library className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
              <h2 className="section-label">Further reading</h2>
            </div>
            <p className="text-xs text-[color:var(--color-subtle-foreground)] mb-4">
              From your reference bookshelf. Links open your Drive copy in a
              new tab.
            </p>
            <ul className="space-y-4">
              {references.map(({ book, chapters, note }) => (
                <li
                  key={book.id}
                  className="flex flex-col gap-1 pb-4 border-b border-[rgba(138,122,109,0.2)] last:border-b-0 last:pb-0"
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <a
                      href={book.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="heading-display font-semibold text-[#7FA3C0] hover:text-[#A7C4DB] transition-colors duration-200 inline-flex items-center gap-1.5"
                    >
                      {book.title}
                      <ExternalLink
                        className="w-3.5 h-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                    <span className="badge badge-highlight">{chapters}</span>
                  </div>
                  <p className="text-xs text-[color:var(--color-subtle-foreground)]">
                    {book.author} · {book.edition}
                  </p>
                  <p className="text-sm text-[color:var(--color-muted-foreground)] leading-relaxed">
                    {note}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav
          className="flex items-center justify-between gap-4 pt-6 border-t border-[rgba(138,122,109,0.32)]"
          aria-label="Chapter pagination"
        >
          {prev ? (
            <Link
              href={`/skillup/vlsi/${prev.slug}`}
              className="btn-ghost text-left max-w-[45%]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/skillup/vlsi/${next.slug}`}
              className="btn-ghost text-right max-w-[45%] ml-auto"
            >
              <span className="truncate">{next.title}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </LearnShell>
  );
}
