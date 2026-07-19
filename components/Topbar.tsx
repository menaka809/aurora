"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useUI } from "@/lib/store";

const TITLES: Record<string, { title: string; sub: string }> = {
  "/": { title: "Overview", sub: "Your growth, in motion." },
  "/analytics": { title: "Analytics", sub: "Revenue and engagement trends." },
  "/customers": { title: "Customers", sub: "Accounts and their health." },
  "/settings": { title: "Settings", sub: "Manage your workspace." },
};

export default function Topbar() {
  const pathname = usePathname();
  const openCommand = useUI((s) => s.setCommandOpen);
  const meta =
    TITLES[pathname] ??
    (pathname.startsWith("/analytics")
      ? TITLES["/analytics"]
      : pathname.startsWith("/customers")
      ? TITLES["/customers"]
      : pathname.startsWith("/settings")
      ? TITLES["/settings"]
      : TITLES["/"]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-bg/80 px-5 backdrop-blur-md md:px-8 print:hidden">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight text-fg">
          {meta.title}
        </h1>
        <p className="hidden truncate text-xs text-muted sm:block">{meta.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => openCommand(true)}
          className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-fg lg:flex"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <kbd className="ml-6 rounded border border-border px-1.5 py-0.5 text-[10px] tabular">
            ⌘K
          </kbd>
        </button>
        <button
          onClick={() => openCommand(true)}
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-fg lg:hidden"
        >
          <Search className="h-4 w-4" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
