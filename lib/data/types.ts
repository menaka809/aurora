import type { Plan } from "@/lib/customers";

export type { DayPoint, Channel } from "@/lib/metrics";
export type { Customer, CustomerProfile, Plan, Status } from "@/lib/customers";

export type Kpi = {
  key: "mrr" | "users" | "churn" | "nrr";
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  /** Absolute change over the window, rounded to 1 decimal. */
  delta: number;
  /** "%" for relative change, "pts" for percentage-point change. */
  deltaUnit: "%" | "pts";
  direction: "up" | "down";
  positiveIsGood: boolean;
  spark: number[];
};

export type Goal = { current: number; target: number };

export type FunnelStage = { stage: string; value: number };

export type PlanSlice = { plan: Plan; mrr: number; pct: number; color: string };

export type ActivityKind = "new" | "upgrade" | "payment" | "failed" | "churn";
export type ActivityItem = {
  id: string;
  customerId: string;
  who: string;
  action: string;
  meta?: string;
  kind: ActivityKind;
  daysAgo: number;
};

/** Minimal customer record for client-side search. */
export type CustomerIndexEntry = { id: string; name: string; email: string; company: string };
