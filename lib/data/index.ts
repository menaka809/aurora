// The one place pages get data from. Everything is derived from a single
// snapshot of "today", so every number on screen agrees with every other.
// Phase 4 swaps these internals for database queries; callers stay the same.

import { cache } from "react";
import { todayUTC, daysBefore } from "@/lib/time";
import { CHANNELS, pctChange, seriesEnding } from "@/lib/metrics";
import { buildCustomers, getProfile as buildProfile, PLANS } from "@/lib/customers";
import {
  applyCustomerQuery,
  filterRows,
  sortRows,
  type CustomerPage,
  type CustomerQuery,
  type CustomerRow,
} from "@/lib/customers-query";
import { BUILT_IN_VIEWS } from "@/lib/views";
import type { Range } from "@/lib/range";
import type {
  Acquisition,
  ActivityItem,
  Customer,
  CustomerIndexEntry,
  CustomerProfile,
  DayPoint,
  FunnelStage,
  Goal,
  Kpi,
  PlanSlice,
} from "./types";

// Two of the longest period (90 days), so every range has a full previous period.
const HISTORY_DAYS = 180;

const snapshot = cache(() => {
  const today = todayUTC();
  const series = seriesEnding(today, HISTORY_DAYS);
  const customers = buildCustomers(today, series[series.length - 1].mrr);
  const profiles = customers.map((c) => buildProfile(c, today));
  const rows: CustomerRow[] = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    company: p.company,
    plan: p.plan,
    listPrice: p.listPrice,
    mrr: p.mrr,
    status: p.status,
    joined: p.joined,
    seats: p.seats,
    manager: p.manager,
    lastLoginDays: p.lastLoginDays,
    ltv: p.ltv,
    health: p.health,
  }));
  return { today, series, customers, profiles, rows };
});

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

// Optional artificial delay (e.g. DEMO_LATENCY_MS=400) so the demo shows its
// loading skeletons the way a real API would. Applied to each page's main
// read; pages fetch in parallel, so a page waits about one delay in total.
const LATENCY_MS = Number(process.env.DEMO_LATENCY_MS ?? 0) || 0;
const demoLatency = () =>
  LATENCY_MS > 0 ? new Promise<void>((r) => setTimeout(r, LATENCY_MS)) : Promise.resolve();

/** Today's reference date (ISO), as used by every other function here. */
export async function getToday(): Promise<string> {
  return snapshot().series[HISTORY_DAYS - 1].date;
}

/** The last `range` days, oldest first. */
export async function getSeries(range: Range): Promise<DayPoint[]> {
  await demoLatency();
  return snapshot().series.slice(-range);
}

/**
 * Headline KPIs for the period. Each is compared with the same point one
 * period earlier ("vs previous 30 days"): relative % for MRR and users,
 * percentage points for churn and NRR.
 */
export async function getKpis(range: Range): Promise<Kpi[]> {
  await demoLatency();
  const { series } = snapshot();
  const window = series.slice(-range);
  const last = series[series.length - 1];
  const prev = series[series.length - 1 - range];

  const relative = (a: number, b: number) => round1(pctChange(a, b));
  const points = (a: number, b: number) => round2(b - a);
  const dir = (d: number): "up" | "down" => (d >= 0 ? "up" : "down");

  const mrr = relative(prev.mrr, last.mrr);
  const users = relative(prev.users, last.users);
  const churn = points(prev.churn, last.churn);
  const nrr = points(prev.nrr, last.nrr);

  return [
    {
      key: "mrr",
      label: "Monthly Recurring Revenue",
      value: last.mrr,
      format: "currency",
      delta: Math.abs(mrr),
      deltaUnit: "%",
      direction: dir(mrr),
      positiveIsGood: true,
      spark: window.map((d) => d.mrr),
    },
    {
      key: "users",
      label: "Active Users",
      value: last.users,
      format: "number",
      delta: Math.abs(users),
      deltaUnit: "%",
      direction: dir(users),
      positiveIsGood: true,
      spark: window.map((d) => d.users),
    },
    {
      key: "churn",
      label: "Churn Rate",
      value: last.churn,
      format: "percent",
      delta: Math.abs(churn),
      deltaUnit: "pts",
      direction: dir(churn),
      positiveIsGood: false,
      spark: window.map((d) => d.churn),
    },
    {
      key: "nrr",
      label: "Net Revenue Retention",
      value: last.nrr,
      format: "percent",
      delta: Math.abs(nrr),
      deltaUnit: "pts",
      direction: dir(nrr),
      positiveIsGood: true,
      spark: window.map((d) => d.nrr),
    },
  ];
}

/** Quarterly MRR target: ~17% above today, rounded up to the next $10k. */
export async function getGoal(): Promise<Goal> {
  const current = snapshot().series[HISTORY_DAYS - 1].mrr;
  return { current, target: Math.ceil((current * 1.17) / 10_000) * 10_000 };
}

/** Total signups in the last `range` days, and in the `range` days before that. */
function signupsFor(range: Range): { current: number; previous: number } {
  const { series } = snapshot();
  const sum = (days: DayPoint[]) => days.reduce((s, d) => s + d.signups, 0);
  return {
    current: sum(series.slice(-range)),
    previous: sum(series.slice(-2 * range, -range)),
  };
}

export async function getAcquisition(range: Range): Promise<Acquisition> {
  const { current, previous } = signupsFor(range);
  return { channels: CHANNELS, signups: current, delta: round1(pctChange(previous, current)) };
}

export async function getFunnel(range: Range): Promise<FunnelStage[]> {
  const signups = signupsFor(range).current;
  const trials = Math.round(signups * 0.41);
  return [
    { stage: "Visitors", value: Math.round(signups / 0.031) },
    { stage: "Signups", value: signups },
    { stage: "Trials", value: trials },
    { stage: "Paid", value: Math.round(trials * 0.29) },
  ];
}

const PLAN_COLOR: Record<string, string> = {
  Starter: "var(--chart-5)",
  Growth: "var(--chart-1)",
  Scale: "var(--chart-2)",
  Enterprise: "var(--chart-4)",
};

export async function getPlanBreakdown(): Promise<PlanSlice[]> {
  const { customers } = snapshot();
  const total = customers.reduce((s, c) => s + c.mrr, 0) || 1;
  return PLANS.map((plan) => {
    const mrr = customers.filter((c) => c.plan === plan).reduce((s, c) => s + c.mrr, 0);
    return { plan, mrr, pct: (mrr / total) * 100, color: PLAN_COLOR[plan] };
  }).sort((a, b) => b.mrr - a.mrr);
}

/** Latest account events, built from the same records as the profiles. */
export async function getActivity(limit = 7, maxPayments = 3): Promise<ActivityItem[]> {
  const { profiles: customers, today } = snapshot();
  const events: ActivityItem[] = [];

  for (const c of customers) {
    for (const e of c.timeline) {
      const daysAgo = daysBefore(e.date, today);
      if (daysAgo > 14) continue;
      const base = { id: e.id, customerId: c.id, who: c.name, daysAgo };
      if (e.kind === "signup")
        events.push({
          ...base,
          kind: "new",
          action: c.status === "trial" ? "started a trial of" : "signed up for",
          meta: e.meta,
        });
      else if (e.kind === "upgrade")
        events.push({ ...base, kind: "upgrade", action: "upgraded to", meta: e.meta });
      else if (e.kind === "churn")
        events.push({ ...base, kind: "churn", action: "cancelled", meta: e.meta });
      else if (e.kind === "payment" && e.outcome === "failed")
        events.push({ ...base, kind: "failed", action: "had a failed payment of", meta: e.meta });
      else if (e.kind === "payment" && e.outcome === "paid")
        events.push({ ...base, kind: "payment", action: "paid invoice", meta: e.meta });
    }
  }

  events.sort((a, b) => a.daysAgo - b.daysAgo || a.id.localeCompare(b.id));

  // Payments are the most frequent event; cap them so the feed shows variety.
  const out: ActivityItem[] = [];
  let payments = 0;
  for (const e of events) {
    if (e.kind === "payment" && payments >= maxPayments) continue;
    if (e.kind === "payment") payments++;
    out.push(e);
    if (out.length === limit) break;
  }
  return out;
}

export async function getCustomers(): Promise<Customer[]> {
  return snapshot().customers;
}

export async function getCustomerIndex(): Promise<CustomerIndexEntry[]> {
  return snapshot().customers.map(({ id, name, email, company }) => ({ id, name, email, company }));
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  return snapshot().customers.find((c) => c.id === id);
}

export async function getProfile(id: string): Promise<CustomerProfile | undefined> {
  await demoLatency();
  return snapshot().profiles.find((p) => p.id === id);
}

/** One filtered, sorted page of the customers table. */
export async function getCustomerPage(query: CustomerQuery): Promise<CustomerPage> {
  await demoLatency();
  const { rows, today } = snapshot();
  return applyCustomerQuery(rows, query, today);
}

/** Row counts for each built-in view tab. */
export async function getViewCounts(): Promise<Record<string, number>> {
  const { rows, today } = snapshot();
  return Object.fromEntries(
    BUILT_IN_VIEWS.map((v) => [v.id, filterRows(rows, v.filters, { todayMs: today }).length])
  );
}

/** Rows for CSV export: specific ids, or everything matching the query. */
export async function getCustomerRowsForExport(
  query: CustomerQuery,
  ids: string[] | null
): Promise<CustomerRow[]> {
  const { rows, today } = snapshot();
  const picked = ids ? rows.filter((r) => ids.includes(r.id)) : filterRows(rows, query, { todayMs: today });
  return sortRows(picked, query.sort, query.dir);
}

/** Staff who can own accounts, for the bulk "Assign manager" action. */
export { MANAGERS } from "@/lib/customers";
