"use client";

import type { ReactNode } from "react";
import {
  ArrowUpDown,
  ClipboardCopy,
  Columns3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Lock,
  Printer,
  RotateCcw,
  Rows3,
  Rows4,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterMenu, type SetFilters } from "./filters";
import { COLUMN_LABELS, DEFAULT_ORDER, PINNED } from "./columns";
import type { CustomerFilters, Facets } from "@/lib/customers-query";
import type { Density } from "@/lib/table-store";

const button =
  "flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-fg transition-colors hover:bg-fg/5 data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/15";

/** Menu header: title plus a muted detail line. */
function MenuHeader({ title, detail }: { title: string; detail: ReactNode }) {
  return (
    <div className="px-2 pb-2 pt-1.5">
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

/** A rich menu item: icon tile, title and one-line description. */
function RichItem({
  icon: Icon,
  title,
  description,
  onSelect,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onSelect?: () => void;
  href?: string;
}) {
  const body = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-fg">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{description}</span>
      </span>
    </>
  );
  return href ? (
    <DropdownMenuItem asChild className="gap-3 px-2 py-2">
      <a href={href} download>
        {body}
      </a>
    </DropdownMenuItem>
  ) : (
    <DropdownMenuItem onSelect={onSelect} className="gap-3 px-2 py-2">
      {body}
    </DropdownMenuItem>
  );
}

export default function Toolbar({
  filters,
  facets,
  setFilters,
  onSearch,
  visibility,
  onToggleColumn,
  onShowAllColumns,
  onResetColumns,
  layoutCustomized,
  sortCustomized,
  sortLabel,
  onResetSort,
  density,
  onDensity,
  total,
  pageCount,
  exportAllHref,
  exportPageHref,
  onCopyAll,
  onPrint,
}: {
  filters: CustomerFilters;
  facets: Facets;
  setFilters: SetFilters;
  onSearch: (q: string) => void;
  visibility: Record<string, boolean>;
  onToggleColumn: (id: string, visible: boolean) => void;
  onShowAllColumns: () => void;
  onResetColumns: () => void;
  /** Column order, widths or visibility differ from the defaults. */
  layoutCustomized: boolean;
  /** Sort differs from the default (MRR, high to low). */
  sortCustomized: boolean;
  sortLabel: string;
  onResetSort: () => void;
  density: Density;
  onDensity: (d: Density) => void;
  total: number;
  /** Rows on the current page. */
  pageCount: number;
  exportAllHref: string;
  exportPageHref: string;
  onCopyAll: () => void;
  onPrint: () => void;
}) {
  const hideable = DEFAULT_ORDER.filter((id) => !PINNED.includes(id));
  const shown = hideable.filter((id) => visibility[id] !== false).length + 1; // + Customer
  const totalColumns = hideable.length + 1;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 md:w-72 md:flex-none">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={filters.q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name, email or company…"
            aria-label="Search customers"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted-foreground"
          />
          {filters.q && (
            <button
              aria-label="Clear search"
              onClick={() => onSearch("")}
              className="text-muted-foreground hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <FilterMenu filters={filters} facets={facets} setFilters={setFilters} />
      </div>

      <div className="flex items-center gap-2">
        {/* Columns and density only apply to the desktop table. */}
        <DropdownMenu>
          <DropdownMenuTrigger className={`${button} hidden md:flex`}>
            <Columns3 className="size-4 text-muted-foreground" />
            Columns
            <span className="tabular rounded-md bg-fg/5 px-1.5 py-px text-[11px] text-muted-foreground">
              {shown}/{totalColumns}
            </span>
            {layoutCustomized && (
              <span
                aria-label="Layout changed"
                title="Layout changed from the default"
                className="size-1.5 rounded-full bg-primary"
              />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-1.5">
            <MenuHeader title="Columns" detail={`${shown} of ${totalColumns} shown`} />
            <DropdownMenuItem disabled className="justify-between px-2 opacity-100 data-disabled:opacity-100">
              <span className="text-fg">{COLUMN_LABELS.name}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Always shown
              </span>
            </DropdownMenuItem>
            {hideable.map((id) => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={visibility[id] !== false}
                onCheckedChange={(v) => onToggleColumn(id, Boolean(v))}
                // Keep the menu open while toggling several columns.
                onSelect={(e) => e.preventDefault()}
                className="px-2"
              >
                {COLUMN_LABELS[id]}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onShowAllColumns();
              }}
              className="px-2"
            >
              <Eye className="size-4 text-muted-foreground" />
              Show all columns
            </DropdownMenuItem>
            {/* Reset actions live in a submenu so they don't dominate the menu. */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                disabled={!layoutCustomized && !sortCustomized}
                className="px-2 data-disabled:opacity-50"
              >
                <RotateCcw className="size-4 text-muted-foreground" />
                Reset
                {(layoutCustomized || sortCustomized) && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary" />
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-60 p-1.5">
                <DropdownMenuItem
                  disabled={!layoutCustomized}
                  onSelect={onResetColumns}
                  className="items-start gap-2.5 px-2 py-1.5"
                >
                  <Columns3 className="mt-0.5 size-4 text-muted-foreground" />
                  <span>
                    <span className="block">Layout</span>
                    <span className="block text-xs text-muted-foreground">
                      Column order, widths and visibility
                    </span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!sortCustomized}
                  onSelect={onResetSort}
                  className="items-start gap-2.5 px-2 py-1.5"
                >
                  <ArrowUpDown className="mt-0.5 size-4 text-muted-foreground" />
                  <span>
                    <span className="block">Sorting</span>
                    <span className="block text-xs text-muted-foreground">
                      {sortCustomized ? `${sortLabel} → MRR ↓ (default)` : "Already the default (MRR ↓)"}
                    </span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!(layoutCustomized && sortCustomized)}
                  onSelect={() => {
                    onResetColumns();
                    onResetSort();
                  }}
                  className="px-2"
                >
                  <RotateCcw className="size-4 text-muted-foreground" />
                  Reset everything
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <div
          role="radiogroup"
          aria-label="Row density"
          className="hidden h-9 items-center rounded-lg border border-border bg-surface p-0.5 md:flex"
        >
          {(
            [
              ["comfortable", Rows3, "Comfortable rows"],
              ["compact", Rows4, "Compact rows"],
            ] as const
          ).map(([value, Icon, label]) => {
            const active = density === value;
            return (
              <button
                key={value}
                role="radio"
                aria-checked={active}
                aria-label={label}
                title={label}
                onClick={() => onDensity(value)}
                className={`flex h-full items-center justify-center rounded-md px-2 transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-fg"
                }`}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className={button}>
            <Download className="size-4 text-muted-foreground" />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-1.5">
            <MenuHeader
              title="Export customers"
              detail={`${total} match the current filters`}
            />
            <RichItem
              icon={FileSpreadsheet}
              title="Download CSV"
              description={`All ${total} matching customers`}
              href={exportAllHref}
            />
            <RichItem
              icon={FileText}
              title="Download this page"
              description={`The ${pageCount} rows you're viewing`}
              href={exportPageHref}
            />
            <RichItem
              icon={ClipboardCopy}
              title="Copy to clipboard"
              description="Pastes into Sheets or Excel as columns"
              onSelect={onCopyAll}
            />
            <DropdownMenuSeparator />
            <RichItem
              icon={Printer}
              title="Print report"
              description="Clean A4 layout with totals"
              onSelect={onPrint}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
