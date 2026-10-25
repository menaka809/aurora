import { EMPTY_FILTERS, FILTER_KEYS, type CustomerFilters } from "./customers-query";

/** A named preset of filters, shown as a tab above the customers table. */
export type ViewDef = { id: string; label: string; filters: CustomerFilters };

const view = (id: string, label: string, filters: Partial<CustomerFilters>): ViewDef => ({
  id,
  label,
  filters: { ...EMPTY_FILTERS, ...filters },
});

export const BUILT_IN_VIEWS: ViewDef[] = [
  view("all", "All", {}),
  view("at-risk", "At risk", { health: ["at_risk"] }),
  view("trials", "Trials", { status: ["trial"] }),
  view("high-value", "High value", { health: ["high_value"] }),
  view("new", "New", { joined: "90d" }),
];

const norm = (v: unknown) =>
  Array.isArray(v) ? [...v].sort().join(",") : v === null || v === undefined ? "" : String(v);

/** Whether the current filters are exactly a view's filters. */
export function filtersEqual(a: CustomerFilters, b: CustomerFilters): boolean {
  return FILTER_KEYS.every((k) => norm(a[k]) === norm(b[k]));
}

export function pickFilters(q: CustomerFilters): CustomerFilters {
  return Object.fromEntries(FILTER_KEYS.map((k) => [k, q[k]])) as CustomerFilters;
}
