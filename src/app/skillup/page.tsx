import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  FileText,
  GraduationCap,
  Map,
} from "lucide-react";
import { LearnShell } from "@/components/layout/LearnShell";
import { getSkillupByTopic } from "@/data/skillup";
import { SKILLUP_KIND_LABEL, type SkillupKind } from "@/data/types";

export const metadata: Metadata = {
  title: "Skillup — AI Atlas",
  description: "VLSI AI roadmap phases, notes, and practice material",
};

const KIND_ICON: Record<SkillupKind, typeof Map> = {
  phase: Map,
  note: FileText,
  snippet: Code2,
};

export default function SkillupPage() {
  const groups = getSkillupByTopic();

  return (
    <LearnShell>
      <div className="mx-auto max-w-5xl px-5 lg:px-8 py-10 space-y-10">
        <header className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#7FA3C0]" aria-hidden="true" />
            <p className="eyebrow">Skillup library</p>
          </div>
          <h1 className="heading-display text-3xl lg:text-4xl font-semibold">
            VLSI AI Engineer track
          </h1>
          <p className="text-[color:var(--color-muted-foreground)] max-w-2xl leading-relaxed">
            The 7-phase upskilling roadmap from embedded AI to VLSI AI engineer,
            with the convergence track, plan audits, and DSA practice notes.
            Roadmap phases cross-link to related AI Atlas concepts.
          </p>
        </header>

        {groups.map(({ topic, items }) => (
          <section key={topic} className="space-y-4">
            <h2 className="section-label">{topic}</h2>
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
                    <h3 className="heading-display text-lg font-semibold leading-snug">
                      {item.title}
                    </h3>
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
    </LearnShell>
  );
}
