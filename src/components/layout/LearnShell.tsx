"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Newspaper } from "lucide-react";

interface LearnShellProps {
  children: React.ReactNode;
}

export function LearnShell({ children }: LearnShellProps) {
  const pathname = usePathname();
  const isLearn = pathname.startsWith("/learn");
  const isExplore = pathname.startsWith("/explore") || pathname.startsWith("/node");
  const isFeed = pathname.startsWith("/feed");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className="border-b bg-surface sticky top-0 z-40"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/learn"
              className="text-xl font-semibold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              AI Atlas
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              Premium interactive learning platform
            </p>
          </div>
          <nav className="flex gap-1" aria-label="Main navigation">
            <Link
              href="/learn"
              className={`nav-link ${isLearn ? "nav-link-active" : ""}`}
              aria-current={isLearn ? "page" : undefined}
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Learn
            </Link>
            <Link
              href="/explore"
              className={`nav-link ${isExplore ? "nav-link-active" : ""}`}
              aria-current={isExplore ? "page" : undefined}
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              Explore
            </Link>
            <Link
              href="/feed"
              className={`nav-link ${isFeed ? "nav-link-active" : ""}`}
              aria-current={isFeed ? "page" : undefined}
            >
              <Newspaper className="w-4 h-4" aria-hidden="true" />
              News
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 lg:px-6 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
