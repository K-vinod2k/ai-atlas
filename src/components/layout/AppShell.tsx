"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Newspaper } from "lucide-react";
import { ChatPanel } from "@/components/agent/ChatPanel";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isExplore = pathname.startsWith("/explore") || pathname.startsWith("/node");
  const isFeed = pathname.startsWith("/feed");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className="border-b bg-surface sticky top-0 z-40"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/explore"
              className="text-xl font-semibold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              AI Atlas
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive map of the AI landscape
            </p>
          </div>
          <nav className="flex gap-1" aria-label="Main navigation">
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

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">
          <main>{children}</main>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ChatPanel />
            </div>
          </aside>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface border-t z-40"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <ChatPanel compact />
      </div>
    </div>
  );
}
