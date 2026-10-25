"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerFilters, SortKey } from "@/lib/customers-query";

export type Density = "comfortable" | "compact";

export type ColumnPrefs = {
  visibility: Record<string, boolean>;
  order: string[];
  sizing: Record<string, number>;
};

export type SavedView = {
  id: string;
  name: string;
  filters: CustomerFilters;
  sort: SortKey;
  dir: "asc" | "desc";
  columns: Pick<ColumnPrefs, "visibility" | "order">;
};

type TableState = {
  columns: ColumnPrefs;
  density: Density;
  savedViews: SavedView[];
  /** Demo edits from bulk actions, keyed by customer id. */
  managerOverrides: Record<string, string>;
  tagOverrides: Record<string, string[]>;
  setColumns: (update: Partial<ColumnPrefs>) => void;
  resetColumns: () => void;
  setDensity: (d: Density) => void;
  saveView: (view: SavedView) => void;
  updateView: (id: string, patch: Partial<Omit<SavedView, "id">>) => void;
  deleteView: (id: string) => void;
  assignManager: (ids: string[], manager: string) => void;
  addTag: (ids: string[], tag: string) => void;
  removeTag: (id: string, tag: string) => void;
};

/** Optional columns start hidden; everything else is visible. */
export const DEFAULT_COLUMNS: ColumnPrefs = {
  visibility: { ltv: false, manager: false, tags: false },
  order: [],
  sizing: {},
};

// Demo-only persistence in localStorage; Phase 4 moves saved views and
// overrides into the database (saved_views, customers.manager, customer_tags).
export const useCustomerTable = create<TableState>()(
  persist(
    (set) => ({
      columns: DEFAULT_COLUMNS,
      density: "comfortable",
      savedViews: [],
      managerOverrides: {},
      tagOverrides: {},
      setColumns: (update) => set((s) => ({ columns: { ...s.columns, ...update } })),
      resetColumns: () => set({ columns: DEFAULT_COLUMNS }),
      setDensity: (density) => set({ density }),
      saveView: (view) => set((s) => ({ savedViews: [...s.savedViews, view] })),
      updateView: (id, patch) =>
        set((s) => ({
          savedViews: s.savedViews.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      deleteView: (id) =>
        set((s) => ({ savedViews: s.savedViews.filter((v) => v.id !== id) })),
      assignManager: (ids, manager) =>
        set((s) => ({
          managerOverrides: {
            ...s.managerOverrides,
            ...Object.fromEntries(ids.map((id) => [id, manager])),
          },
        })),
      addTag: (ids, tag) =>
        set((s) => {
          const next = { ...s.tagOverrides };
          for (const id of ids) {
            const current = next[id] ?? [];
            if (!current.includes(tag)) next[id] = [...current, tag];
          }
          return { tagOverrides: next };
        }),
      removeTag: (id, tag) =>
        set((s) => ({
          tagOverrides: {
            ...s.tagOverrides,
            [id]: (s.tagOverrides[id] ?? []).filter((t) => t !== tag),
          },
        })),
    }),
    { name: "aurora-customers-table" }
  )
);
