"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FlexRender, useTable, type Header } from "@tanstack/react-table";
import type {
  ColumnOrderState,
  ColumnSizingState,
  ColumnVisibilityState,
  RowSelectionState,
  SortingState,
  Updater,
} from "@tanstack/table-core";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "./dnd-modifiers";
import { ArrowDown, ArrowUp, ChevronsUpDown, GripVertical } from "lucide-react";
import { columns, features, PINNED, type TableRow } from "./columns";
import type { Density } from "@/lib/table-store";
import { COLUMN_SIZES } from "@/lib/customer-columns";

type Feat = typeof features;

const resolve = <T,>(updater: Updater<T>, current: T): T =>
  typeof updater === "function" ? (updater as (old: T) => T)(current) : updater;

/**
 * Fill the container without a gap. Columns the user resized keep their exact
 * width; every other visible column starts at its default width and shares the
 * spare space in proportion. If every column was resized, the last one takes
 * the slack. When the columns are wider than the container, nothing stretches
 * and the table scrolls sideways.
 */
function fitToWidth(
  width: number | null,
  order: ColumnOrderState,
  visibility: ColumnVisibilityState,
  userSizing: ColumnSizingState
): ColumnSizingState {
  if (width === null) return {};
  const visible = order.filter((id) => visibility[id] !== false);
  const sizeOf = (id: string) => userSizing[id] ?? COLUMN_SIZES[id];
  const extra = width - visible.reduce((s, id) => s + sizeOf(id), 0);
  if (extra <= 0) return {};

  const flexible = visible.filter((id) => id !== "select" && userSizing[id] === undefined);
  const targets = flexible.length ? flexible : [visible[visible.length - 1]];
  const base = targets.reduce((s, id) => s + sizeOf(id), 0);

  const sizing: ColumnSizingState = {};
  let used = 0;
  for (const id of targets) {
    const add = Math.floor((extra * sizeOf(id)) / base);
    sizing[id] = sizeOf(id) + add;
    used += add;
  }
  // Rounding leftovers go to one column so the fit is pixel-exact.
  const sink = targets.includes("name") ? "name" : targets[targets.length - 1];
  sizing[sink] += extra - used;
  return sizing;
}

/** Keep only what the user actually changed: the dragged column, or a reset. */
function userChanges(
  next: ColumnSizingState,
  shown: ColumnSizingState,
  user: ColumnSizingState
): ColumnSizingState {
  const out = { ...user };
  for (const id of Object.keys(next)) if (next[id] !== shown[id]) out[id] = next[id];
  for (const id of Object.keys(shown)) if (!(id in next)) delete out[id]; // double-click reset
  return out;
}

export default function DataTable({
  rows,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
  columnSizing,
  onColumnSizingChange,
  density,
  pending,
  onOpenRow,
  empty,
}: {
  rows: TableRow[];
  sorting: SortingState;
  onSortingChange: (next: SortingState) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (next: RowSelectionState) => void;
  columnVisibility: ColumnVisibilityState;
  onColumnVisibilityChange: (next: ColumnVisibilityState) => void;
  columnOrder: ColumnOrderState;
  onColumnOrderChange: (next: ColumnOrderState) => void;
  columnSizing: ColumnSizingState;
  onColumnSizingChange: (next: ColumnSizingState) => void;
  density: Density;
  pending: boolean;
  onOpenRow: (id: string) => void;
  empty: ReactNode;
}) {
  // Measure the scroll container so columns can fill it exactly.
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const autoSizing = useMemo(
    () => fitToWidth(width, columnOrder, columnVisibility, columnSizing),
    [width, columnOrder, columnVisibility, columnSizing]
  );
  // User widths first; auto widths fill the rest (and may top up the last column).
  const sizing = useMemo(() => ({ ...columnSizing, ...autoSizing }), [autoSizing, columnSizing]);

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.id,
    manualSorting: true,
    // Third click on a header clears its sort; the view then falls back to the default.
    enableSortingRemoval: true,
    enableMultiSort: false,
    columnResizeMode: "onChange",
    enableRowSelection: true,
    state: { sorting, rowSelection, columnVisibility, columnOrder, columnSizing: sizing, columnPinning },
    onSortingChange: (u) => onSortingChange(resolve(u, sorting)),
    onRowSelectionChange: (u) => onRowSelectionChange(resolve(u, rowSelection)),
    onColumnVisibilityChange: (u) => onColumnVisibilityChange(resolve(u, columnVisibility)),
    onColumnOrderChange: (u) => onColumnOrderChange(resolve(u, columnOrder)),
    onColumnSizingChange: (u) =>
      onColumnSizingChange(userChanges(resolve(u, sizing), sizing, columnSizing)),
  });

  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const movable = table.getCenterLeafColumns().map((c) => c.id);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = columnOrder.indexOf(String(active.id));
    const to = columnOrder.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onColumnOrderChange(arrayMove(columnOrder, from, to));
  };

  const pad = density === "compact" ? "py-1" : "py-3";
  const visibleCount = table.getVisibleLeafColumns().length;

  return (
    <div ref={containerRef} className="relative overflow-x-auto">
      {pending && (
        <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden bg-primary/15">
          <div className="table-progress h-full w-1/3 bg-primary" />
        </div>
      )}
      <DndContext
        // Stable id so dnd-kit's aria-describedby matches between server and client.
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={onDragEnd}
      >
        <table
          data-density={density}
          className="group/table table-fixed border-collapse text-sm data-[density=compact]:text-[13px]"
          // Before the first measurement (server render) stretch to 100%, which
          // looks the same as the auto-fit; afterwards use the exact total.
          style={{ width: width === null ? "100%" : table.getTotalSize() }}
        >
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-border">
                <SortableContext items={movable} strategy={horizontalListSortingStrategy}>
                  {group.headers.map((header) => (
                    <HeaderCell key={header.id} header={header} />
                  ))}
                </SortableContext>
              </tr>
            ))}
          </thead>
          <tbody className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                aria-selected={row.getIsSelected()}
                onClick={() => onOpenRow(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target === e.currentTarget) onOpenRow(row.id);
                }}
                className="group cursor-pointer border-b border-border outline-none transition-colors last:border-0 hover:bg-elevated focus-visible:bg-elevated aria-selected:bg-primary/5"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`overflow-hidden text-ellipsis whitespace-nowrap px-3 ${pad} sm:px-4 ${
                      cell.column.id === "select" ? "print:hidden" : ""
                    }`}
                    style={pinnedStyle(cell.column)}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={visibleCount}>{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}

type Col = Header<Feat, TableRow, unknown>["column"];

/**
 * Column width plus sticky positioning for the pinned start columns. With a
 * fixed table layout, any spare width is shared across columns in proportion
 * to their sizes, so no single column ends up with a big gap.
 */
function pinnedStyle(column: Col): CSSProperties {
  const pinned = column.getIsPinned() === "start";
  return {
    width: column.getSize(),
    ...(pinned && {
      position: "sticky",
      insetInlineStart: column.getStart("start"),
      zIndex: 1,
      background: "inherit",
    }),
  };
}

function HeaderCell({ header }: { header: Header<Feat, TableRow, unknown> }) {
  const { column } = header;
  const pinned = PINNED.includes(column.id);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useSortable({ id: column.id, disabled: pinned });

  const sorted = column.getIsSorted();
  const canSort = column.getCanSort();
  const ariaSort = sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";
  const resize = header.getResizeHandler();

  return (
    <th
      ref={setNodeRef}
      aria-sort={canSort ? ariaSort : undefined}
      className={`group/th relative bg-surface px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors sm:px-4 ${
        column.id === "select" ? "print:hidden" : ""
      } ${!pinned ? "hover:bg-fg/3" : ""} ${
        isDragging ? "z-20 bg-elevated opacity-90 shadow-lg ring-1 ring-primary/40" : ""
      }`}
      style={{
        ...pinnedStyle(column),
        ...(pinned && { zIndex: 2 }),
        transform: CSS.Translate.toString(transform),
      }}
    >
      {/* The grip fits inside the cell's 16px left padding, so it never touches the label. */}
      {!pinned && (
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${String(column.columnDef.header)} column`}
          title="Drag to reorder"
          className="absolute left-0.5 top-1/2 flex h-6 w-3 -translate-y-1/2 cursor-grab items-center justify-center rounded text-transparent transition-colors group-hover/th:text-muted-foreground hover:bg-primary/10 hover:text-primary! focus-visible:text-primary active:cursor-grabbing print:hidden"
        >
          <GripVertical className="size-3" />
        </button>
      )}
      <div className="flex min-w-0 items-center whitespace-nowrap">

        {header.isPlaceholder ? null : canSort ? (
          <button
            onClick={column.getToggleSortingHandler()}
            title={
              sorted
                ? "Click to reverse · click again to return to the default sort"
                : "Click to sort by this column"
            }
            className={`inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-fg ${
              sorted ? "text-fg" : ""
            }`}
          >
            <span className="truncate">
              <FlexRender header={header} />
            </span>
            {sorted === "asc" ? (
              <ArrowUp className="size-3.5 shrink-0 text-primary" />
            ) : sorted === "desc" ? (
              <ArrowDown className="size-3.5 shrink-0 text-primary" />
            ) : (
              <ChevronsUpDown className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/th:opacity-50" />
            )}
          </button>
        ) : (
          <FlexRender header={header} />
        )}
      </div>

      {/* 10px grab area at the column edge; its line shows whenever the header is hovered. */}
      {column.getCanResize() && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${String(column.columnDef.header)} column`}
          title="Drag to resize · double-click to reset"
          onMouseDown={resize}
          onTouchStart={resize}
          onDoubleClick={() => column.resetSize()}
          className="group/resize absolute inset-y-0 right-0 z-10 flex w-2.5 cursor-col-resize touch-none justify-end print:hidden"
        >
          <span
            className={`my-auto w-0.5 rounded-full transition-all ${
              column.getIsResizing()
                ? "h-full bg-primary"
                : "h-4 bg-border opacity-0 group-hover/th:opacity-100 group-hover/resize:h-6 group-hover/resize:bg-primary"
            }`}
          />
        </div>
      )}
    </th>
  );
}

const columnPinning = { start: PINNED, end: [] as string[] };
