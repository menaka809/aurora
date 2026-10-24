"use client";

import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/components/StatusBadge";
import { avatarColor, initials } from "@/lib/customers";
import { formatCurrency, formatDaysAgo } from "@/lib/format";
import type { TableRow } from "./columns";

/** Phone layout: one card per customer instead of a squeezed table row. */
export default function CustomerCard({
  c,
  selected,
  onToggle,
  onOpen,
}: {
  c: TableRow;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <li
      className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
        selected ? "bg-primary/5" : ""
      }`}
    >
      <Checkbox
        aria-label={`Select ${c.name}`}
        checked={selected}
        onCheckedChange={onToggle}
        className="mt-2.5"
      />
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ background: avatarColor(c.name) }}
        >
          {initials(c.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-sm text-fg">{c.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {c.company} · {c.plan}
              </span>
            </span>
            <span className="tabular shrink-0 text-sm font-medium text-fg">
              {c.mrr ? formatCurrency(c.mrr) : "—"}
            </span>
          </span>
          <span className="mt-2 flex items-center justify-between gap-2">
            <StatusBadge status={c.status} />
            <span
              className={`text-xs ${c.lastLoginDays > 30 ? "text-warning" : "text-muted-foreground"}`}
            >
              Seen {formatDaysAgo(c.lastLoginDays).toLowerCase()}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
