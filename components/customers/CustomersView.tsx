"use client";

import { useMemo, useState, useTransition } from "react";
import { debounce, useQueryStates } from "nuqs";
import type { RowSelectionState, SortingState } from "@tanstack/table-core";
import { ArrowUpDown, ChevronLeft, ChevronRight, SearchX, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/Card";
import MessageSheet, { type Recipient } from "@/components/MessageSheet";
import DataTable from "./DataTable";
import Toolbar from "./Toolbar";
import ViewTabs from "./ViewTabs";
import BulkBar from "./BulkBar";
import CustomerCard from "./CustomerCard";
import QuickView from "./QuickView";
import { FilterChips, type SetFilters } from "./filters";
import { COLUMN_LABELS, DEFAULT_ORDER, type TableRow } from "./columns";
import {
  EMPTY_FILTERS,
  PAGE_SIZES,
  customerSearchParams,
  describeFilters,
  serializeCustomerQuery,
  type CustomerFilters,
  type CustomerPage,
  type SortKey,
} from "@/lib/customers-query";
import type { CustomerProfile } from "@/lib/customers";
import { pickFilters } from "@/lib/views";
import { DEFAULT_COLUMNS, useCustomerTable, type SavedView } from "@/lib/table-store";
import { useHydrated } from "@/lib/useHydrated";
import { toast } from "@/lib/toast";

const NO_OVERRIDES: Record<string, never> = {};
const NO_VIEWS: SavedView[] = [];

export default function CustomersView({
  page,
  viewCounts,
  today,
  managers,
  directory,
  preview,
}: {
  page: CustomerPage;
  viewCounts: Record<string, number>;
  today: string;
  managers: string[];
  /** Every customer's contact details, for messaging selections across pages. */
  directory: (Recipient & { id: string })[];
  /** Full profile for the quick-view drawer, when `?preview=` is set. */
  preview: CustomerProfile | null;
}) {
  const [pending, startTransition] = useTransition();
  // URL is the source of truth; the server re-renders the page for each change.
  const [query, setQuery] = useQueryStates(customerSearchParams, {
    shallow: false,
    scroll: false,
    startTransition,
  });

  const hydrated = useHydrated();
  const store = useCustomerTable();
  const prefs = hydrated ? store.columns : DEFAULT_COLUMNS;
  const density = hydrated ? store.density : "comfortable";
  const savedViews = hydrated ? store.savedViews : NO_VIEWS;
  const managerOverrides = hydrated ? store.managerOverrides : NO_OVERRIDES;
  const tagOverrides = hydrated ? store.tagOverrides : NO_OVERRIDES;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [messageOpen, setMessageOpen] = useState(false);
  const selectedIds = Object.keys(rowSelection);

  const filters = useMemo(() => pickFilters(query), [query]);

  // Server rows plus demo edits from bulk actions.
  const rows = useMemo<TableRow[]>(
    () =>
      page.rows.map((r) => ({
        ...r,
        manager: managerOverrides[r.id] ?? r.manager,
        tags: tagOverrides[r.id] ?? [],
      })),
    [page.rows, managerOverrides, tagOverrides]
  );

  // Stored order, plus any columns added since it was saved.
  const columnOrder = useMemo(() => {
    const stored = prefs.order.filter((id) => DEFAULT_ORDER.includes(id));
    return [...stored, ...DEFAULT_ORDER.filter((id) => !stored.includes(id))];
  }, [prefs.order]);

  const sorting = useMemo<SortingState>(
    () => [{ id: query.sort, desc: query.dir === "desc" }],
    [query.sort, query.dir]
  );

  const setFilters: SetFilters = (patch) => setQuery({ ...patch, page: 1 });
  const clearAll = () => setQuery({ ...EMPTY_FILTERS, page: 1 });
  const onSearch = (q: string) =>
    setQuery({ q, page: 1 }, { limitUrlUpdates: q ? debounce(250) : undefined });

  // Links that carry the current filters and sort (and optionally the page).
  const withQuery = (path: string, extra: string, includePage = false) => {
    const qs = serializeCustomerQuery({
      ...filters,
      sort: query.sort,
      dir: query.dir,
      ...(includePage && { page: page.page, size: query.size }),
    });
    return `${path}${qs}${extra ? `${qs ? "&" : "?"}${extra}` : ""}`;
  };
  const exportAllHref = withQuery("/api/customers/export", "");
  const exportPageHref = withQuery("/api/customers/export", "scope=page", true);
  const selectedExportHref = `/api/customers/export?ids=${selectedIds.join(",")}&sort=${query.sort}&dir=${query.dir}`;
  const visibleColumns = columnOrder.filter((id) => id !== "select" && prefs.visibility[id] !== false);

  const copyAll = async () => {
    try {
      const tsv = await fetch(withQuery("/api/customers/export", "format=tsv")).then((r) => r.text());
      await navigator.clipboard.writeText(tsv);
      toast("Copied to clipboard", { description: `${page.total} customers — paste into Sheets or Excel.` });
    } catch {
      toast("Couldn't copy", { type: "error" });
    }
  };
  const printReport = () =>
    window.open(withQuery("/print/customers", `cols=${visibleColumns.join(",")}`), "_blank");

  // Has the layout or sort been changed from the defaults? (Drives the reset controls.)
  const layoutCustomized =
    Object.keys(prefs.sizing).length > 0 ||
    columnOrder.join() !== DEFAULT_ORDER.join() ||
    DEFAULT_ORDER.some(
      (id) => (prefs.visibility[id] !== false) !== (DEFAULT_COLUMNS.visibility[id] !== false)
    );
  const sortCustomized = query.sort !== "mrr" || query.dir !== "desc";
  const sortLabel = `${COLUMN_LABELS[query.sort] ?? query.sort} ${query.dir === "asc" ? "↑" : "↓"}`;
  const resetSort = () => setQuery({ sort: null, dir: null, page: 1 });

  const sortChip = sortCustomized ? (
    <div className="card-shadow flex h-8 items-center overflow-hidden rounded-lg border border-border bg-surface text-xs text-fg">
      <span className="flex h-full items-center gap-2 pl-2.5 pr-2">
        <ArrowUpDown className="size-3.5 shrink-0 text-primary" />
        <span className="text-muted-foreground">Sorted by</span>
        <span className="h-3.5 w-px bg-border" />
        <span className="font-medium">{sortLabel}</span>
      </span>
      <button
        aria-label="Reset sorting"
        title="Reset to the default sort (MRR, high to low)"
        onClick={resetSort}
        className="flex h-full items-center border-l border-border px-2 text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg"
      >
        <X className="size-3.5" />
      </button>
    </div>
  ) : null;

  const allPageSelected = rows.length > 0 && rows.every((r) => rowSelection[r.id]);
  const showSelectAll = allPageSelected && page.total > rows.length && selectedIds.length < page.total;

  const openRow = (id: string) => setQuery({ preview: id }, { history: "push" });
  const closePreview = () => setQuery({ preview: null });
  const previewRow = rows.find((r) => r.id === query.preview) ?? null;
  const previewProfile = preview && preview.id === query.preview ? preview : null;

  const applyView = (f: CustomerFilters) => setQuery({ ...f, page: 1 });

  const recipients = directory.filter((d) => rowSelection[d.id]);

  const empty = (
    <div className="flex flex-col items-center px-5 py-14 text-center">
      <SearchX className="size-6 text-muted-foreground/60" />
      <p className="mt-3 text-sm text-fg">No customers match these filters</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        {describeFilters(filters).join(" · ")}
      </p>
      <button
        onClick={clearAll}
        className="mt-4 rounded-lg border border-border px-3 py-1.5 text-sm text-fg transition-colors hover:bg-fg/5"
      >
        Clear all filters
      </button>
    </div>
  );

  const start = page.total === 0 ? 0 : (page.page - 1) * query.size + 1;
  const end = Math.min(page.total, page.page * query.size);

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="print:hidden">
      <ViewTabs
        filters={filters}
        counts={viewCounts}
        savedViews={savedViews}
        onSelectBuiltIn={applyView}
        onSelectSaved={(v) => {
          setQuery({ ...v.filters, sort: v.sort, dir: v.dir, page: 1 });
          store.setColumns(v.columns);
        }}
        onSave={(name) => {
          store.saveView({
            id: crypto.randomUUID(),
            name,
            filters,
            sort: query.sort,
            dir: query.dir,
            columns: { visibility: prefs.visibility, order: columnOrder },
          });
          toast("View saved", { description: `“${name}” is now a tab.` });
        }}
        onDelete={(id) => store.deleteView(id)}
      />
      </div>

      <Toolbar
        filters={filters}
        facets={page.facets}
        setFilters={setFilters}
        onSearch={onSearch}
        visibility={prefs.visibility}
        onToggleColumn={(id, visible) =>
          store.setColumns({ visibility: { ...prefs.visibility, [id]: visible } })
        }
        onShowAllColumns={() =>
          store.setColumns({
            visibility: Object.fromEntries(DEFAULT_ORDER.map((id) => [id, true])),
          })
        }
        onResetColumns={store.resetColumns}
        layoutCustomized={layoutCustomized}
        sortCustomized={sortCustomized}
        sortLabel={sortLabel}
        onResetSort={resetSort}
        density={density}
        onDensity={store.setDensity}
        total={page.total}
        pageCount={rows.length}
        exportAllHref={exportAllHref}
        exportPageHref={exportPageHref}
        onCopyAll={copyAll}
        onPrint={printReport}
      />

      <div className="print:hidden">
        <FilterChips
          filters={filters}
          facets={page.facets}
          setFilters={setFilters}
          onClearAll={clearAll}
          trailing={sortChip}
        />
      </div>

      {showSelectAll && (
        <div className="flex flex-wrap items-center gap-x-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-fg print:hidden">
          All {rows.length} customers on this page are selected.
          <button
            onClick={() =>
              setRowSelection(Object.fromEntries(page.matchingIds.map((id) => [id, true as const])))
            }
            className="font-medium text-primary hover:underline"
          >
            Select all {page.total} matching
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Printing (Ctrl+P) always uses the full table, never the phone cards. */}
        <div className="hidden md:block print:block">
          <DataTable
            rows={rows}
            sorting={sorting}
            onSortingChange={(next) => {
              const s = next[0];
              // No sort left (third click) means back to the default: MRR, high to low.
              if (s) setQuery({ sort: s.id as SortKey, dir: s.desc ? "desc" : "asc", page: 1 });
              else resetSort();
            }}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            columnVisibility={prefs.visibility}
            onColumnVisibilityChange={(visibility) => store.setColumns({ visibility })}
            columnOrder={columnOrder}
            onColumnOrderChange={(order) => store.setColumns({ order })}
            columnSizing={prefs.sizing}
            onColumnSizingChange={(sizing) => store.setColumns({ sizing })}
            density={density}
            pending={pending}
            onOpenRow={openRow}
            empty={empty}
          />
        </div>

        <ul className={`divide-y divide-border md:hidden print:hidden ${pending ? "opacity-60" : ""}`}>
          {rows.map((c) => (
            <CustomerCard
              key={c.id}
              c={c}
              selected={Boolean(rowSelection[c.id])}
              onToggle={() =>
                setRowSelection((s) => {
                  const next = { ...s };
                  if (next[c.id]) delete next[c.id];
                  else next[c.id] = true;
                  return next;
                })
              }
              onOpen={() => openRow(c.id)}
            />
          ))}
          {rows.length === 0 && <li>{empty}</li>}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5 print:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:text-fg">
              Rows per page <span className="tabular font-medium text-fg">{query.size}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={String(query.size)}
                onValueChange={(v) =>
                  setQuery({ size: Number(v) as (typeof PAGE_SIZES)[number], page: 1 })
                }
              >
                {PAGE_SIZES.map((n) => (
                  <DropdownMenuRadioItem key={n} value={String(n)}>
                    {n}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            <span className="tabular">
              {start}–{end} of {page.total}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setQuery({ page: page.page - 1 })}
                disabled={page.page <= 1}
                aria-label="Previous page"
                className="flex size-8 items-center justify-center rounded-lg border border-border transition-colors hover:text-fg disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => setQuery({ page: page.page + 1 })}
                disabled={page.page >= page.pageCount}
                aria-label="Next page"
                className="flex size-8 items-center justify-center rounded-lg border border-border transition-colors hover:text-fg disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {selectedIds.length > 0 && (
        <BulkBar
          count={selectedIds.length}
          managers={managers}
          exportHref={selectedExportHref}
          onCopy={async () => {
            try {
              const csv = await fetch(selectedExportHref).then((r) => r.text());
              await navigator.clipboard.writeText(csv);
              toast("Copied to clipboard", { description: `${selectedIds.length} rows as CSV` });
            } catch {
              toast("Couldn't copy", { type: "error" });
            }
          }}
          onAssign={(m) => {
            store.assignManager(selectedIds, m);
            store.setColumns({ visibility: { ...prefs.visibility, manager: true } });
            toast("Manager assigned", { description: `${m} now owns ${selectedIds.length} accounts.` });
          }}
          onTag={(t) => {
            store.addTag(selectedIds, t);
            store.setColumns({ visibility: { ...prefs.visibility, tags: true } });
            toast("Tag added", { description: `“${t}” added to ${selectedIds.length} customers.` });
          }}
          onMessage={() => setMessageOpen(true)}
          onClear={() => setRowSelection({})}
        />
      )}

      <MessageSheet open={messageOpen} onOpenChange={setMessageOpen} recipients={recipients} />

      <QuickView
        row={previewRow}
        profile={previewProfile}
        tags={query.preview ? (tagOverrides[query.preview] ?? []) : []}
        today={today}
        onClose={closePreview}
      />
    </div>
  );
}
