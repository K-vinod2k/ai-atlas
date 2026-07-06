"use client";

import "katex/dist/katex.min.css";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Lightbulb } from "lucide-react";
import { SkillupMermaid } from "./SkillupMermaid";
import { slugifyHeading } from "./heading-utils";

interface ChapterBodyProps {
  body: string;
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement(node)) {
    return nodeText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/** Blockquotes beginning with "Analogy:" render as highlighted callouts. */
function isAnalogyQuote(children: ReactNode): boolean {
  return nodeText(children).trimStart().toLowerCase().startsWith("analogy");
}

/** remark-math only treats $$ fences on their own lines as display math;
 * expand single-line $$eq$$ so authored display equations render as blocks. */
function expandDisplayMath(markdown: string): string {
  return markdown.replace(
    /^\$\$(.+)\$\$\s*$/gm,
    (_, eq: string) => `$$\n${eq}\n$$`,
  );
}

export function ChapterBody({ body }: ChapterBodyProps) {
  return (
    <div className="prose-skillup">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h2({ children }) {
            const text = nodeText(children);
            return <h2 id={slugifyHeading(text)}>{children}</h2>;
          },
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className ?? "");
            if (match?.[1] === "mermaid") {
              return (
                <SkillupMermaid source={nodeText(children)} title="Diagram" />
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre({ children }) {
            // Mermaid blocks render their own <figure>; skip the <pre> wrapper.
            const child = Children.toArray(children)[0];
            if (
              isValidElement(child) &&
              /language-mermaid/.test(
                (child.props as { className?: string }).className ?? "",
              )
            ) {
              return <>{children}</>;
            }
            return <pre>{children}</pre>;
          },
          blockquote({ children }) {
            if (isAnalogyQuote(children)) {
              return (
                <aside
                  className="my-6 rounded-xl p-4 flex gap-3"
                  style={{
                    background: "rgba(232,213,196,0.06)",
                    border: "1px solid rgba(232,213,196,0.28)",
                  }}
                >
                  <Lightbulb
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: "#E8D5C4" }}
                    aria-hidden="true"
                  />
                  <div className="[&>p]:mb-2 [&>p:last-child]:mb-0 text-[0.92rem] leading-relaxed">
                    {children}
                  </div>
                </aside>
              );
            }
            return <blockquote>{children}</blockquote>;
          },
        }}
      >
        {expandDisplayMath(body)}
      </Markdown>
    </div>
  );
}
