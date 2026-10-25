import type { Plan } from "@/lib/customers";
import type { Channel } from "@/lib/metrics";

export type { DayPoint, Channel } from "@/lib/metrics";
export type { Customer, CustomerProfile, Plan, Status } from "@/lib/customers";

export type Kpi = {
  key: "mrr" | "users" | "churn" | "nrr";
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  /** Size of the change vs the same point one period earlier (direction says which way). */
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

export type Acquisition = {
  channels: Channel[];
  /** Signups in the period. */
  signups: number;
  /** % change vs the previous period of the same length. */
  delta: number;
};
