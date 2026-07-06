import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Code2,
  FileText,
  GraduationCap,
  Map,
} from "lucide-react";
import { LearnShell } from "@/components/layout/LearnShell";
import { getSkillupByTopic } from "@/data/skillup";
import { getChaptersByPart, TEXTBOOK_CHAPTERS } from "@/data/vlsi-textbook";
import { SKILLUP_KIND_LABEL, type SkillupKind } from "@/data/types";

export const metadata: Metadata = {
  title: "Skillup — AI Atlas",
  description:
    "VLSI textbook, AI roadmap phases, notes, and practice material",
};

const KIND_ICON: Record<SkillupKind, typeof Map> = {
  phase: Map,
  note: FileText,
  snippet: Code2,
};

export default function SkillupPage() {
  const planGroups = getSkillupByTopic();
  const bookParts = getChaptersByPart();
  const totalMinutes = TEXTBOOK_CHAPTERS.reduce((sum, c) => sum + c.minutes, 0);

  return (
    <LearnShell>
      <div className="mx-auto max-w-5xl px-5 lg:px-8 py-10 space-y-12">
        <header className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap
              className="w-5 h-5 text-[#7FA3C0]"
              aria-hidden="true"
            />
            <p className="eyebrow">Skillup library</p>
          </div>
          <h1 className="heading-display text-3xl lg:text-4xl font-semibold">
            VLSI AI Engineer track
          </h1>
          <p className="text-[color:var(--color-muted-foreground)] max-w-2xl leading-relaxed">
            A full VLSI textbook — device physics through AI accelerators —
            alongside the 7-phase upskilling roadmap, plan audits, and DSA
            practice notes. Chapters and phases cross-link to related AI Atlas
            concepts.
          </p>
        </header>

        {/* ---- My Plan ---- */}
        <div className="space-y-10">
          <div className="space-y-1">
            <h2 className="heading-display text-2xl font-semibold">My Plan</h2>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Roadmap phases, audits, and practice notes.
            </p>
          </div>

          {planGroups.map(({ topic, items }) => (
            <section key={topic} className="space-y-4">
              <h3 className="section-label">{topic}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => {
                  const Icon = KIND_ICON[item.kind];
                  return (
                    <Link
                      key={item.slug}
                      href={`/skillup/${item.slug}`}
                      className="card card-interactive flex flex-col gap-3 group"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge">
                          <Icon className="w-3 h-3 mr-1" aria-hidden="true" />
                          {SKILLUP_KIND_LABEL[item.kind]}
                        </span>
                        {item.weeks && (
                          <span className="badge-highlight badge">
                            {item.weeks}
                          </span>
                        )}
                      </div>
                      <h4 className="heading-display text-lg font-semibold leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[color:var(--color-muted-foreground)] leading-relaxed">
                        {item.summary}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#7FA3C0] group-hover:text-[#A7C4DB] transition-colors duration-200">
                        Open
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* ---- VLSI Textbook ---- */}
        <div className="space-y-8">
          <div className="glass-panel rounded-2xl p-6 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#7FA3C0]" aria-hidden="true" />
              <p className="eyebrow">VLSI textbook</p>
            </div>
            <h2 className="heading-display text-2xl font-semibold">
              Basics to VLSI: a full course
            </h2>
            <p className="text-sm text-[color:var(--color-muted-foreground)] max-w-2xl leading-relaxed">
              {TEXTBOOK_CHAPTERS.length} chapters across{" "}
              {bookParts.length} parts — semiconductor physics, digital design,
              the RTL-to-GDSII flow, verification, and AI accelerator
              architecture. With diagrams, worked math, and one analogy per
              chapter.
            </p>
            <p className="text-xs text-[color:var(--color-subtle-foreground)]">
              About {Math.round(totalMinutes / 60)} hours of reading total.
            </p>
          </div>

          {bookParts.map(({ part, chapters }) => (
            <section key={part.id} className="space-y-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="heading-display text-xl font-semibold">
                  Part {part.number}: {part.title}
                </h3>
                <span className="badge badge-highlight">
                  {chapters.length} chapters
                </span>
              </div>
              <p className="text-sm text-[color:var(--color-muted-foreground)] max-w-2xl">
                {part.description}
              </p>
              <ol className="space-y-2">
                {chapters.map((chapter) => (
                  <li key={chapter.slug}>
                    <Link
                      href={`/skillup/vlsi/${chapter.slug}`}
                      className="card card-interactive flex items-start gap-4 group"
                    >
                      <span
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                        style={{
                          background: "rgba(127,163,192,0.12)",
                          border: "1px solid rgba(127,163,192,0.3)",
                          color: "#7FA3C0",
                        }}
                        aria-hidden="true"
                      >
                        {chapter.order}
                      </span>
                      <span className="flex flex-col gap-1 min-w-0">
                        <span className="heading-display font-semibold leading-snug group-hover:text-[#A7C4DB] transition-colors duration-200">
                          {chapter.title}
                        </span>
                        <span className="text-sm text-[color:var(--color-muted-foreground)] leading-relaxed">
                          {chapter.summary}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[color:var(--color-subtle-foreground)]">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {chapter.minutes} min read
                        </span>
                      </span>
                      <ArrowRight
                        className="w-4 h-4 shrink-0 mt-1 ml-auto text-[#7FA3C0] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </LearnShell>
  );
}
