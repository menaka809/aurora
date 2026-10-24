"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCopy,
  Download,
  FileText,
  Printer,
  Search,
} from "lucide-react";
import { avatarColor, initials, type Customer } from "@/lib/customers";
import { formatCurrency, formatDate } from "@/lib/format";
import { daysBefore, fromISO } from "@/lib/time";
import { downloadCSV, copyRows } from "@/lib/export";
import { toast } from "@/lib/toast";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import Popover, { MenuItem, MenuLabel } from "@/components/Popover";

const DEFAULT_DIR: Record<SortKey, 1 | -1> = {
  name: 1,
  plan: 1,
  mrr: -1,
  status: 1,
  joined: -1,
  seats: -1,
};

const SORT_LABEL: Record<SortKey, { asc: string; desc: string }> = {
  name: { asc: "A → Z", desc: "Z → A" },
  plan: { asc: "A → Z", desc: "Z → A" },
  status: { asc: "A → Z", desc: "Z → A" },
  mrr: { asc: "Low → High", desc: "High → Low" },
  seats: { asc: "Fewest first", desc: "Most first" },
  joined: { asc: "Oldest first", desc: "Newest first" },
};

/** Joined-date filters, as a maximum age in days (null = no limit). */
const RANGES: { key: string; label: string; maxDays: number | null }[] = [
  { key: "all", label: "All time", maxDays: null },
  { key: "30d", label: "Last 30 days", maxDays: 30 },
  { key: "90d", label: "Last 90 days", maxDays: 90 },
  { key: "12m", label: "Last 12 months", maxDays: 365 },
];

type SortKey = "name" | "plan" | "mrr" | "status" | "joined" | "seats";
const PAGE_SIZE = 8;

const COLS: {
  key: SortKey;
  label: string;
  width: string;
  hide?: string;
}[] = [
  { key: "name", label: "Customer", width: "" },
  { key: "plan", label: "Plan", width: "w-[14%]", hide: "hidden sm:table-cell" },
  // No fixed width on phones: the three visible columns share the row evenly.
  { key: "mrr", label: "MRR", width: "sm:w-[13%]" },
  { key: "status", label: "Status", width: "sm:w-[15%]" },
  { key: "joined", label: "Joined", width: "w-[16%]", hide: "hidden lg:table-cell" },
  { key: "seats", label: "Seats", width: "w-[9%]", hide: "hidden md:table-cell" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};
const rowV: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function CustomersTable({
  customers,
  today,
}: {
  customers: Customer[];
  /** Reference date (ISO) the joined-date filters count back from. */
  today: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rangeKey, setRangeKey] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "mrr",
    dir: -1,
  });
  const [page, setPage] = useState(0);

  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[0];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const todayMs = fromISO(today);
    const filtered = customers.filter((c) => {
      if (range.maxDays !== null && daysBefore(c.joined, todayMs) > range.maxDays)
        return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
  }, [customers, today, query, sort, range]);

  const clearFilters = () => {
    setQuery("");
    setRangeKey("all");
    setPage(0);
  };

  const doCopy = async () => {
    if (await copyRows(rows))
      toast("Copied to clipboard", { description: `${rows.length} rows copied` });
    else toast("Couldn't copy", { type: "error" });
  };

  const doExport = () => {
    downloadCSV(rows);
    toast("Export ready", { description: "customers.csv downloaded" });
  };

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setPage(0);
    setSort((s) =>
      s.key === key
        ? { key, dir: (s.dir * -1) as 1 | -1 }
        : { key, dir: DEFAULT_DIR[key] }
    );
  };

  const activeCol = COLS.find((c) => c.key === sort.key)!;
  const dirLabel = SORT_LABEL[sort.key][sort.dir === 1 ? "asc" : "desc"];

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 md:w-72">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, email or company…"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort */}
          <Popover
            align="right"
            width="w-60"
            trigger={
              <span className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg transition-colors hover:bg-elevated">
                <ArrowUpDown className="h-4 w-4 text-muted" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="font-medium">{activeCol.label}</span>
                <span className="hidden text-xs text-muted md:inline">
                  {dirLabel}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </span>
            }
          >
            <MenuLabel>Sort by</MenuLabel>
            {COLS.map((col) => {
              const active = sort.key === col.key;
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${
                    active ? "text-fg" : "text-muted"
                  }`}
                >
                  <span>{col.label}</span>
                  {active ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      {SORT_LABEL[col.key][sort.dir === 1 ? "asc" : "desc"]}
                      {sort.dir === 1 ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  ) : (
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                  )}
                </button>
              );
            })}
          </Popover>

          {/* Date-range filter */}
          <Popover
            align="right"
            trigger={
              <span className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg transition-colors hover:bg-elevated">
                <CalendarDays className="h-4 w-4 text-muted" />
                {range.label}
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </span>
            }
          >
            <MenuLabel>Joined</MenuLabel>
            {RANGES.map((r) => (
              <MenuItem
                key={r.key}
                icon={r.key === rangeKey ? Check : undefined}
                onClick={() => {
                  setRangeKey(r.key);
                  setPage(0);
                }}
              >
                {r.label}
              </MenuItem>
            ))}
          </Popover>

          {/* Export */}
          <Popover
            align="right"
            trigger={
              <span className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg transition-colors hover:bg-elevated">
                <Download className="h-4 w-4 text-muted" />
                Export
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </span>
            }
          >
            <MenuLabel>Export {rows.length} rows</MenuLabel>
            <MenuItem icon={FileText} onClick={doExport}>
              Download CSV
            </MenuItem>
            <MenuItem icon={ClipboardCopy} onClick={doCopy}>
              Copy to clipboard
            </MenuItem>
            <MenuItem icon={Printer} onClick={() => window.print()}>
              Print
            </MenuItem>
          </Popover>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-border">
              {COLS.map((col) => {
                const active = sort.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-left text-xs sm:px-4 font-medium uppercase tracking-wide text-muted ${col.width} ${col.hide ?? ""}`}
                  >
                    <button
                      onClick={() => toggleSort(col.key)}
                      className={`group inline-flex items-center gap-1.5 align-middle transition-colors hover:text-fg ${
                        active ? "text-fg" : ""
                      }`}
                    >
                      <span>{col.label}</span>
                      {active ? (
                        sort.dir === 1 ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <motion.tbody
            key={`${sort.key}-${sort.dir}-${current}-${query}-${rangeKey}`}
            variants={container}
            initial="hidden"
            animate="show"
          >
            {pageRows.map((c) => (
              <Row
                key={c.id}
                c={c}
                onOpen={() => router.push(`/customers/${c.id}`)}
              />
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="px-5 py-14 text-center">
                  <Search className="mx-auto h-6 w-6 text-muted/50" />
                  <p className="mt-3 text-sm text-fg">No customers match these filters</p>
                  <p className="mt-1 text-xs text-muted">
                    {query
                      ? `Nothing found for “${query}” in ${range.label.toLowerCase()}.`
                      : `No customers joined in ${range.label.toLowerCase()}.`}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 rounded-lg border border-border px-3 py-1.5 text-sm text-fg transition-colors hover:bg-elevated"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 print:hidden">
          <span className="text-xs text-muted">
            Page <span className="tabular text-fg">{current + 1}</span> of{" "}
            <span className="tabular">{pageCount}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-fg disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={current >= pageCount - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-fg disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ c, onOpen }: { c: Customer; onOpen: () => void }) {
  return (
    <motion.tr
      variants={rowV}
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      className="cursor-pointer border-b border-border text-sm outline-none transition-colors last:border-0 hover:bg-elevated focus-visible:bg-elevated"
    >
      <td className="px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: avatarColor(c.name) }}
          >
            {initials(c.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-fg">{c.name}</p>
            <p className="truncate text-xs text-muted">{c.company}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-3 sm:px-4 text-muted sm:table-cell">{c.plan}</td>
      <td className="tabular px-3 py-3 sm:px-4 font-medium text-fg">
        {c.mrr ? formatCurrency(c.mrr) : "—"}
      </td>
      <td className="px-3 py-3 sm:px-4">
        <StatusBadge status={c.status} />
      </td>
      <td className="tabular hidden px-3 py-3 sm:px-4 text-muted lg:table-cell">
        {formatDate(c.joined)}
      </td>
      <td className="tabular hidden px-3 py-3 sm:px-4 text-muted md:table-cell">
        {c.seats}
      </td>
    </motion.tr>
  );
}
