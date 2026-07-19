import { CUSTOMERS } from "./customers";

export const MRR_CURRENT = 128400;
export const MRR_GOAL = 150000;

export type FunnelStage = { stage: string; value: number };
export const FUNNEL: FunnelStage[] = [
  { stage: "Visitors", value: 48200 },
  { stage: "Signups", value: 8932 },
  { stage: "Trials", value: 3140 },
  { stage: "Paid", value: 1684 },
];

const PLAN_COLOR: Record<string, string> = {
  Starter: "#6B6F7B",
  Growth: "#5B8DEF",
  Scale: "#3FD68C",
  Enterprise: "#8B5BEF",
};

export type PlanSlice = { plan: string; mrr: number; pct: number; color: string };

export function planBreakdown(): PlanSlice[] {
  const map = new Map<string, number>();
  for (const c of CUSTOMERS) {
    map.set(c.plan, (map.get(c.plan) ?? 0) + c.mrr);
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return entries.map(([plan, mrr]) => ({
    plan,
    mrr,
    pct: (mrr / total) * 100,
    color: PLAN_COLOR[plan] ?? "#5B8DEF",
  }));
}

export type ActivityKind = "new" | "upgrade" | "payment" | "churn";
export type Activity = {
  id: string;
  who: string;
  action: string;
  meta?: string;
  kind: ActivityKind;
  time: string;
};

export const ACTIVITY: Activity[] = [
  { id: "a1", who: "Ava Bennett", action: "upgraded to", meta: "Scale", kind: "upgrade", time: "2m" },
  { id: "a2", who: "Owen Nakamura", action: "started a trial", kind: "new", time: "14m" },
  { id: "a3", who: "Nina Petrova", action: "paid invoice", meta: "$2,369", kind: "payment", time: "38m" },
  { id: "a4", who: "Kai Andersson", action: "churned from", meta: "Starter", kind: "churn", time: "1h" },
  { id: "a5", who: "Léa Moreau", action: "added 12 seats", kind: "upgrade", time: "2h" },
  { id: "a6", who: "Diego Salcedo", action: "signed up", kind: "new", time: "3h" },
  { id: "a7", who: "Hana Suzuki", action: "paid invoice", meta: "$640", kind: "payment", time: "5h" },
];
