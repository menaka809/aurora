"use client";

import Link from "next/link";
import {
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/components/StatusBadge";
import { avatarColor, initials } from "@/lib/customers";
import type { CustomerRow } from "@/lib/customers-query";
import { formatCurrency, formatDate, formatDaysAgo } from "@/lib/format";
import {
  COLUMN_LABELS,
  COLUMN_MAX_SIZE,
  COLUMN_MIN_SIZES,
  COLUMN_SIZES,
} from "@/lib/customer-columns";

/** A table row: the server row plus demo tags added through bulk actions. */
export type TableRow = CustomerRow & { tags: string[] };

// Server owns filtering, sorting and paging; the table only manages layout and selection.
export const features = tableFeatures({
  columnVisibilityFeature,
  columnOrderingFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
});

const helper = createColumnHelper<typeof features, TableRow>();

export { COLUMN_LABELS, DEFAULT_ORDER, PINNED } from "@/lib/customer-columns";

/** Default, minimum and maximum width for a column. */
const sizeOf = (id: string) => ({
  size: COLUMN_SIZES[id],
  minSize: COLUMN_MIN_SIZES[id],
  maxSize: COLUMN_MAX_SIZE,
});

export const columns = helper.columns([
  helper.display({
    id: "select",
    ...sizeOf("select"),
    enableResizing: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows on this page"
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onClick={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        // Click (not change) keeps Shift for range selection.
        onClick={(e) => {
          e.stopPropagation();
          row.getToggleSelectedHandler()(e);
        }}
      />
    ),
  }),
  helper.accessor("name", {
    header: COLUMN_LABELS.name,
    ...sizeOf("name"),
    enableHiding: false,
    cell: ({ row }) => {
      const c = row.original;
      return (
        // Compact density (set on the <table>): smaller avatar, company beside the name.
        <div className="flex min-w-0 items-center gap-3 group-data-[density=compact]/table:gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white group-data-[density=compact]/table:size-6 group-data-[density=compact]/table:text-[9px]"
            style={{ background: avatarColor(c.name) }}
          >
            {initials(c.name)}
          </span>
          <div className="min-w-0 group-data-[density=compact]/table:flex group-data-[density=compact]/table:items-baseline group-data-[density=compact]/table:gap-2">
            <Link
              href={`/customers/${c.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-fg hover:underline group-data-[density=compact]/table:shrink-0"
            >
              {c.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{c.company}</p>
          </div>
        </div>
      );
    },
  }),
  helper.accessor("plan", {
    header: COLUMN_LABELS.plan,
    ...sizeOf("plan"),
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  helper.accessor("mrr", {
    header: COLUMN_LABELS.mrr,
    ...sizeOf("mrr"),
    sortDescFirst: true,
    cell: (info) => (
      <span className="tabular font-medium text-fg">
        {info.getValue() ? formatCurrency(info.getValue()) : "—"}
      </span>
    ),
  }),
  helper.accessor("status", {
    header: COLUMN_LABELS.status,
    ...sizeOf("status"),
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  helper.accessor("lastLoginDays", {
    id: "lastSeen",
    header: COLUMN_LABELS.lastSeen,
    ...sizeOf("lastSeen"),
    cell: (info) => (
      <span className={info.getValue() > 30 ? "text-warning" : "text-muted-foreground"}>
        {formatDaysAgo(info.getValue())}
      </span>
    ),
  }),
  helper.accessor("seats", {
    header: COLUMN_LABELS.seats,
    ...sizeOf("seats"),
    sortDescFirst: true,
    cell: (info) => <span className="tabular text-muted-foreground">{info.getValue()}</span>,
  }),
  helper.accessor("joined", {
    header: COLUMN_LABELS.joined,
    ...sizeOf("joined"),
    sortDescFirst: true,
    cell: (info) => (
      <span className="tabular text-muted-foreground">{formatDate(info.getValue())}</span>
    ),
  }),
  helper.accessor("ltv", {
    header: COLUMN_LABELS.ltv,
    ...sizeOf("ltv"),
    sortDescFirst: true,
    cell: (info) => (
      <span className="tabular text-muted-foreground">{formatCurrency(info.getValue())}</span>
    ),
  }),
  helper.accessor("manager", {
    header: COLUMN_LABELS.manager,
    ...sizeOf("manager"),
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  helper.accessor("tags", {
    header: COLUMN_LABELS.tags,
    ...sizeOf("tags"),
    enableSorting: false,
    cell: (info) => (
      <div className="flex flex-wrap gap-1">
        {info.getValue().map((t) => (
          <span
            key={t}
            className="rounded border border-border bg-elevated px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    ),
  }),
]);
