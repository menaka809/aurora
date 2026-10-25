"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useUI } from "@/lib/store";
import { navItemFor } from "@/lib/nav";
import { useIsMac } from "@/lib/useIsMac";

export default function Topbar() {
  const pathname = usePathname();
  const openCommand = useUI((s) => s.setCommandOpen);
  const item = navItemFor(pathname);
  const meta = { title: item.label, sub: item.subtitle };
  const shortcut = useIsMac() ? "⌘K" : "Ctrl K";

  return (
    // Blur only on larger screens; on phones a near-solid bar is cheaper to paint.
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-bg/95 px-5 md:bg-bg/80 md:px-8 md:backdrop-blur-md print:hidden">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight text-fg">
          {meta.title}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => openCommand(true)}
          aria-keyshortcuts="Control+K Meta+K"
          className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg lg:flex"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <kbd className="ml-6 rounded border border-border px-1.5 py-0.5 text-[10px] tabular">
            {shortcut}
          </kbd>
        </button>
        <button
          onClick={() => openCommand(true)}
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg lg:hidden"
        >
          <Search className="h-4 w-4" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
