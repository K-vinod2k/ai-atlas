import Link from "next/link";
import { ChatPanel } from "@/components/agent/ChatPanel";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/explore" className="text-lg font-semibold text-neutral-900">
              AI Atlas
            </Link>
            <p className="text-xs text-neutral-500">
              Interactive map of the AI landscape
            </p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/explore" className="text-neutral-600 hover:text-neutral-900">
              Explore
            </Link>
            <Link href="/feed" className="text-neutral-600 hover:text-neutral-900">
              News
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <main>{children}</main>
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <ChatPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
