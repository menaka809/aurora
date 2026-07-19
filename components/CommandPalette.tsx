"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LineChart,
  Users,
  Settings,
  Search,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { useUI } from "@/lib/store";
import { CUSTOMERS, initials, avatarColor } from "@/lib/customers";

type Result = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon?: LucideIcon;
  color?: string;
  group: "Navigate" | "Customers";
};

const PAGES: Result[] = [
  { id: "nav-overview", label: "Overview", href: "/", icon: LayoutDashboard, group: "Navigate" },
  { id: "nav-analytics", label: "Analytics", href: "/analytics", icon: LineChart, group: "Navigate" },
  { id: "nav-customers", label: "Customers", href: "/customers", icon: Users, group: "Navigate" },
  { id: "nav-settings", label: "Settings", href: "/settings", icon: Settings, group: "Navigate" },
];

export default function CommandPalette() {
  const open = useUI((s) => s.commandOpen);
  const setOpen = useUI((s) => s.setCommandOpen);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUI.getState().commandOpen);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const pages = PAGES.filter((p) => p.label.toLowerCase().includes(q));
    const customers: Result[] = CUSTOMERS.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
      .slice(0, q ? 6 : 3)
      .map((c) => ({
        id: c.id,
        label: c.name,
        hint: c.email,
        href: "/customers",
        color: avatarColor(c.name),
        group: "Customers",
      }));
    return [...pages, ...customers];
  }, [query]);

  const go = (r: Result) => {
    setOpen(false);
    router.push(r.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active]);
    }
  };

  let idx = -1;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-elevated shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search pages and customers…"
                className="w-full bg-transparent py-4 text-sm text-fg outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] tabular text-muted">
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  No results for “{query}”.
                </p>
              )}
              {(["Navigate", "Customers"] as const).map((group) => {
                const items = results.filter((r) => r.group === group);
                if (!items.length) return null;
                return (
                  <div key={group} className="mb-1">
                    <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                      {group}
                    </p>
                    {items.map((r) => {
                      idx++;
                      const isActive = idx === active;
                      const rowIdx = idx;
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.id}
                          onMouseEnter={() => setActive(rowIdx)}
                          onClick={() => go(r)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            isActive ? "bg-surface text-fg" : "text-muted"
                          }`}
                        >
                          {Icon ? (
                            <Icon className="h-4 w-4 shrink-0" />
                          ) : (
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                              style={{ background: r.color }}
                            >
                              {initials(r.label)}
                            </span>
                          )}
                          <span className="truncate text-fg">{r.label}</span>
                          {r.hint && (
                            <span className="truncate text-xs text-muted">
                              {r.hint}
                            </span>
                          )}
                          {isActive && (
                            <CornerDownLeft className="ml-auto h-3.5 w-3.5 shrink-0 text-muted" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
