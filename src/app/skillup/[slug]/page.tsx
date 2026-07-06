import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { LearnShell } from "@/components/layout/LearnShell";
import { getSkillupItem, getSkillupItems, getSkillupSlugs } from "@/data/skillup";
import { getNodeById } from "@/data/taxonomy";
import { SKILLUP_KIND_LABEL } from "@/data/types";

interface SkillupDetailProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getSkillupSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: SkillupDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getSkillupItem(slug);
  return {
    title: item ? `${item.title} — Skillup — AI Atlas` : "Skillup — AI Atlas",
  };
}

export default async function SkillupDetailPage({
  params,
}: SkillupDetailProps) {
  const { slug } = await params;
  const item = getSkillupItem(slug);
  if (!item) notFound();

  const items = getSkillupItems();
  const index = items.findIndex((i) => i.slug === slug);
  const prev = index > 0 ? items[index - 1] : undefined;
  const next = index < items.length - 1 ? items[index + 1] : undefined;

  const relatedNodes = (item.relatedNodeIds ?? [])
    .map((id) => getNodeById(id)?.node)
    .filter((n): n is NonNullable<typeof n> => n !== undefined);

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
              {SKILLUP_KIND_LABEL[item.kind]}
            </span>
            <span className="badge">{item.topic}</span>
            {item.weeks && (
              <span className="badge badge-highlight">{item.weeks}</span>
            )}
          </div>
          <h1 className="heading-display text-3xl lg:text-4xl font-semibold leading-tight">
            {item.title}
          </h1>
          <p className="text-[color:var(--color-muted-foreground)] leading-relaxed">
            {item.summary}
          </p>
        </header>

        <article className="prose-skillup">
          <Markdown remarkPlugins={[remarkGfm]}>{item.body}</Markdown>
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

        <nav
          className="flex items-center justify-between gap-4 pt-6 border-t border-[rgba(138,122,109,0.32)]"
          aria-label="Skillup pagination"
        >
          {prev ? (
            <Link
              href={`/skillup/${prev.slug}`}
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
              href={`/skillup/${next.slug}`}
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
