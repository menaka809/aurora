// The customers table's query: URL parsers shared by the server page, the
// client toolbar and the CSV export route, plus the pure filter/sort/page
// function. Phase 4 replaces `applyCustomerQuery` with SQL; the URL contract
// stays the same.

import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";
import {
  HEALTH_LABEL,
  PLANS,
  STATUS_LABEL,
  type Customer,
  type Health,
  type Plan,
  type Status,
} from "./customers";
import { formatCurrency } from "./format";
import { daysBefore } from "./time";

export const STATUSES = ["active", "trial", "past_due", "churned"] as const satisfies readonly Status[];
export const HEALTHS = ["at_risk", "high_value", "new", "win_back"] as const satisfies readonly Health[];
export const LAST_SEEN = ["7d", "30d", "inactive30"] as const;
export const JOINED = ["30d", "90d", "12m"] as const;
export const SORT_KEYS = [
  "name", "plan", "mrr", "status", "lastSeen", "seats", "joined", "ltv", "manager",
] as const;
export const PAGE_SIZES = [10, 25, 50] as const;

export type LastSeen = (typeof LAST_SEEN)[number];
export type Joined = (typeof JOINED)[number];
export type SortKey = (typeof SORT_KEYS)[number];

export const LAST_SEEN_LABEL: Record<LastSeen, string> = {
  "7d": "Active in last 7 days",
  "30d": "Active in last 30 days",
  inactive30: "Inactive 30+ days",
};
export const JOINED_LABEL: Record<Joined, string> = {
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};
const JOINED_DAYS: Record<Joined, number> = { "30d": 30, "90d": 90, "12m": 365 };

export const customerSearchParams = {
  q: parseAsString.withDefault(""),
  plan: parseAsArrayOf(parseAsStringLiteral(PLANS)).withDefault([]),
  status: parseAsArrayOf(parseAsStringLiteral(STATUSES)).withDefault([]),
  health: parseAsArrayOf(parseAsStringLiteral(HEALTHS)).withDefault([]),
  mrrMin: parseAsInteger,
  mrrMax: parseAsInteger,
  seatsMin: parseAsInteger,
  seatsMax: parseAsInteger,
  lastSeen: parseAsStringLiteral(LAST_SEEN),
  joined: parseAsStringLiteral(JOINED),
  sort: parseAsStringLiteral(SORT_KEYS).withDefault("mrr"),
  dir: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
  size: parseAsNumberLiteral(PAGE_SIZES).withDefault(25),
  /** Customer id shown in the quick-view drawer. */
  preview: parseAsString,
};

export type CustomerQuery = inferParserType<typeof customerSearchParams>;

export const loadCustomerQuery = createLoader(customerSearchParams);
export const serializeCustomerQuery = createSerializer(customerSearchParams);

/** The filter part of a query (what views and chips describe). */
export const FILTER_KEYS = [
  "q", "plan", "status", "health", "mrrMin", "mrrMax", "seatsMin", "seatsMax", "lastSeen", "joined",
] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type CustomerFilters = Pick<CustomerQuery, FilterKey>;

export const EMPTY_FILTERS: CustomerFilters = {
  q: "",
  plan: [],
  status: [],
  health: [],
  mrrMin: null,
  mrrMax: null,
  seatsMin: null,
  seatsMax: null,
  lastSeen: null,
  joined: null,
};

/** A table row: the customer plus the profile fields the table shows. */
export type CustomerRow = Customer & {
  manager: string;
  lastLoginDays: number;
  ltv: number;
  health: Health[];
};

type FilterOpts = { todayMs: number; skip?: FilterKey };

function matches(r: CustomerRow, f: CustomerFilters, { todayMs, skip }: FilterOpts): boolean {
  const on = (k: FilterKey) => k !== skip;
  const q = f.q.trim().toLowerCase();
  if (on("q") && q && !`${r.name} ${r.email} ${r.company}`.toLowerCase().includes(q)) return false;
  if (on("plan") && f.plan.length && !f.plan.includes(r.plan)) return false;
  if (on("status") && f.status.length && !f.status.includes(r.status)) return false;
  if (on("health") && f.health.length && !f.health.some((h) => r.health.includes(h))) return false;
  if (on("mrrMin") && f.mrrMin !== null && r.mrr < f.mrrMin) return false;
  if (on("mrrMax") && f.mrrMax !== null && r.mrr > f.mrrMax) return false;
  if (on("seatsMin") && f.seatsMin !== null && r.seats < f.seatsMin) return false;
  if (on("seatsMax") && f.seatsMax !== null && r.seats > f.seatsMax) return false;
  if (on("lastSeen") && f.lastSeen) {
    const d = r.lastLoginDays;
    if (f.lastSeen === "7d" && d > 7) return false;
    if (f.lastSeen === "30d" && d > 30) return false;
    if (f.lastSeen === "inactive30" && d <= 30) return false;
  }
  if (on("joined") && f.joined && daysBefore(r.joined, todayMs) > JOINED_DAYS[f.joined]) return false;
  return true;
}

export function filterRows(rows: CustomerRow[], f: CustomerFilters, opts: FilterOpts): CustomerRow[] {
  return rows.filter((r) => matches(r, f, opts));
}

const SORT_VALUE: Record<SortKey, (r: CustomerRow) => string | number> = {
  name: (r) => r.name,
  plan: (r) => ["Starter", "Growth", "Scale", "Enterprise"].indexOf(r.plan),
  mrr: (r) => r.mrr,
  status: (r) => r.status,
  lastSeen: (r) => r.lastLoginDays,
  seats: (r) => r.seats,
  joined: (r) => r.joined,
  ltv: (r) => r.ltv,
  manager: (r) => r.manager,
};

export function sortRows(rows: CustomerRow[], sort: SortKey, dir: "asc" | "desc"): CustomerRow[] {
  const value = SORT_VALUE[sort];
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = value(a);
    const bv = value(b);
    const cmp =
      typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return cmp * sign || a.name.localeCompare(b.name);
  });
}

export type Facets = {
  plan: Record<Plan, number>;
  status: Record<Status, number>;
  health: Record<Health, number>;
  /** Full-dataset bounds for the range sliders. */
  mrr: [number, number];
  seats: [number, number];
};

function countBy<K extends string>(rows: CustomerRow[], keys: readonly K[], get: (r: CustomerRow) => K[]) {
  const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
  for (const r of rows) for (const k of get(r)) out[k]++;
  return out;
}

/** Option counts for each facet, applying every filter except the facet's own. */
export function buildFacets(rows: CustomerRow[], f: CustomerFilters, todayMs: number): Facets {
  const without = (skip: FilterKey) => filterRows(rows, f, { todayMs, skip });
  const mrrs = rows.map((r) => r.mrr);
  const seats = rows.map((r) => r.seats);
  return {
    plan: countBy(without("plan"), PLANS, (r) => [r.plan]),
    status: countBy(without("status"), STATUSES, (r) => [r.status]),
    health: countBy(without("health"), HEALTHS, (r) => r.health),
    mrr: [Math.min(...mrrs), Math.max(...mrrs)],
    seats: [Math.min(...seats), Math.max(...seats)],
  };
}

export type CustomerPage = {
  rows: CustomerRow[];
  total: number;
  page: number;
  pageCount: number;
  /** Every id matching the filters, for "select all N matching". */
  matchingIds: string[];
  facets: Facets;
};

export function applyCustomerQuery(all: CustomerRow[], query: CustomerQuery, todayMs: number): CustomerPage {
  const filtered = sortRows(filterRows(all, query, { todayMs }), query.sort, query.dir);
  const pageCount = Math.max(1, Math.ceil(filtered.length / query.size));
  const page = Math.min(Math.max(1, query.page), pageCount);
  return {
    rows: filtered.slice((page - 1) * query.size, page * query.size),
    total: filtered.length,
    page,
    pageCount,
    matchingIds: filtered.map((r) => r.id),
    facets: buildFacets(all, query, todayMs),
  };
}

/** True when no filter is set. */
export function hasFilters(f: CustomerFilters): boolean {
  return FILTER_KEYS.some((k) => {
    const v = f[k];
    return Array.isArray(v) ? v.length > 0 : v !== null && v !== "";
  });
}

const rangeText = (lo: number | null, hi: number | null, fmt: (n: number) => string) =>
  lo !== null && hi !== null ? `${fmt(lo)}–${fmt(hi)}` : lo !== null ? `≥ ${fmt(lo)}` : `≤ ${fmt(hi!)}`;

/** Plain-language list of the active filters (empty state, print report). */
export function describeFilters(f: CustomerFilters): string[] {
  const parts: string[] = [];
  if (f.q.trim()) parts.push(`Search: “${f.q.trim()}”`);
  if (f.plan.length) parts.push(`Plan: ${f.plan.join(", ")}`);
  if (f.status.length) parts.push(`Status: ${f.status.map((s) => STATUS_LABEL[s]).join(", ")}`);
  if (f.health.length) parts.push(`Health: ${f.health.map((h) => HEALTH_LABEL[h]).join(", ")}`);
  if (f.mrrMin !== null || f.mrrMax !== null)
    parts.push(`MRR: ${rangeText(f.mrrMin, f.mrrMax, (n) => formatCurrency(n, true))}`);
  if (f.seatsMin !== null || f.seatsMax !== null)
    parts.push(`Seats: ${rangeText(f.seatsMin, f.seatsMax, String)}`);
  if (f.lastSeen) parts.push(`Last seen: ${LAST_SEEN_LABEL[f.lastSeen]}`);
  if (f.joined) parts.push(`Joined: ${JOINED_LABEL[f.joined]}`);
  return parts;
}
