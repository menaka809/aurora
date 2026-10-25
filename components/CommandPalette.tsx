"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Moon, Printer, Sun } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUI } from "@/lib/store";
import { useResolvedTheme } from "@/lib/theme";
import { NAV } from "@/lib/nav";
import { initials, avatarColor } from "@/lib/customers";
import type { CustomerIndexEntry } from "@/lib/data/types";

/** Customers shown before the user types anything. */
const SUGGESTED = 5;

/**
 * ⌘K / Ctrl+K palette on cmdk: a real combobox (announced selection,
 * arrow keys that wrap) with fuzzy matching across pages, customers and
 * quick actions.
 */
export default function CommandPalette({ customers }: { customers: CustomerIndexEntry[] }) {
  const open = useUI((s) => s.commandOpen);
  const setOpen = useUI((s) => s.setCommandOpen);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUI.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };
  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  const shownCustomers = query.trim() ? customers : customers.slice(0, SUGGESTED);
  const isLight = useResolvedTheme() === "light";

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search pages, customers and actions"
      className="max-w-xl sm:max-w-xl"
    >
      <Command loop className="p-1.5">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search pages, customers and companies…"
        />
        <CommandList className="max-h-[min(26rem,55vh)] pt-1">
          <CommandEmpty>
            No results for “{query}”.
            <span className="mt-1 block text-xs text-muted-foreground">
              Try a customer&apos;s name, email or company.
            </span>
          </CommandEmpty>

          <CommandGroup heading="Navigate">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={`page ${item.label} ${item.subtitle}`}
                  onSelect={() => run(() => router.push(item.href))}
                  className="py-2"
                >
                  <Icon className="text-muted-foreground" />
                  <span className="text-fg">{item.label}</span>
                  <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandGroup heading={query.trim() ? "Customers" : "Customers · top accounts"}>
            {shownCustomers.map((c) => (
              <CommandItem
                key={c.id}
                // cmdk matches against this text; the id keeps values unique.
                value={`customer ${c.name} ${c.company} ${c.email} ${c.id}`}
                onSelect={() => run(() => router.push(`/customers/${c.id}`))}
                className="py-2"
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: avatarColor(c.name) }}
                >
                  {initials(c.name)}
                </span>
                <span className="truncate text-fg">{c.name}</span>
                <span className="truncate text-xs text-muted-foreground">{c.company}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="action switch theme dark light mode"
              onSelect={() => run(toggleTheme)}
              className="py-2"
            >
              {isLight ? <Moon className="text-muted-foreground" /> : <Sun className="text-muted-foreground" />}
              Switch to {isLight ? "dark" : "light"} mode
            </CommandItem>
            <CommandItem
              value="action export customers csv download"
              onSelect={() => run(() => window.location.assign("/api/customers/export"))}
              className="py-2"
            >
              <FileSpreadsheet className="text-muted-foreground" />
              Export all customers as CSV
            </CommandItem>
            <CommandItem
              value="action print customer report"
              onSelect={() => run(() => window.open("/print/customers", "_blank"))}
              className="py-2"
            >
              <Printer className="text-muted-foreground" />
              Print customer report
            </CommandItem>
          </CommandGroup>
        </CommandList>

        <div className="mt-1 flex items-center gap-4 border-t border-border px-3 pt-2 pb-1 text-[11px] text-muted-foreground">
          {[
            ["↑↓", "navigate"],
            ["↵", "open"],
            ["esc", "close"],
          ].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5">
              <kbd className="tabular rounded border border-border px-1.5 py-px text-[10px]">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </Command>
    </CommandDialog>
  );
}
