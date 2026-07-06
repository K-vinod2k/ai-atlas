"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { BookOpen, MessageCircle, Newspaper, Sparkles } from "lucide-react";
import { ChatDrawer } from "@/components/agent/ChatDrawer";

interface LearnShellProps {
  children: React.ReactNode;
}

export function LearnShell({ children }: LearnShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isLearn = pathname.startsWith("/learn");
  const isFeed = pathname.startsWith("/feed");
  const [guideOpen, setGuideOpen] = useState(false);

  const handleGuideNavigate = useCallback(
    (nodeId: string) => {
      router.replace(`/learn?node=${nodeId}`, { scroll: false });
      setGuideOpen(false);
    },
    [router],
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-30 border-b border-[rgba(122,226,207,0.18)] bg-[rgba(6,32,43,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex w-full items-center justify-between gap-6 px-5 lg:px-8 py-3.5">
          <Link
            href="/learn"
            className="group flex items-center gap-3 cursor-pointer"
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, rgba(7,122,125,0.35), rgba(122,226,207,0.12))",
                borderColor: "rgba(122,226,207,0.4)",
                boxShadow: "0 0 0 1px rgba(122,226,207,0.15) inset",
              }}
              aria-hidden="true"
            >
              <Sparkles className="w-4 h-4 text-[#FDEB9E]" aria-hidden="true" />
            </span>
            <div className="hidden sm:block">
              <p
                className="heading-display text-base font-semibold leading-none text-foreground"
              >
                AI Atlas
              </p>
              <p className="text-[11px] text-[color:var(--color-muted-foreground)] mt-1 tracking-wide">
                Interactive map of the AI landscape
              </p>
            </div>
          </Link>

          <nav
            className="flex items-center gap-1"
            aria-label="Main navigation"
          >
            <Link
              href="/learn"
              className={`nav-link ${isLearn ? "nav-link-active" : ""}`}
              aria-current={isLearn ? "page" : undefined}
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Learn</span>
            </Link>
            <Link
              href="/feed"
              className={`nav-link ${isFeed ? "nav-link-active" : ""}`}
              aria-current={isFeed ? "page" : undefined}
            >
              <Newspaper className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">News</span>
            </Link>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="btn-secondary ml-2 py-2 px-3 text-sm"
              aria-label="Open guide"
              aria-haspopup="dialog"
              aria-expanded={guideOpen}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <ChatDrawer
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onNavigate={handleGuideNavigate}
      />
    </div>
  );
}
