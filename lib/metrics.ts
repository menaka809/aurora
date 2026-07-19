// Deterministic 90-day metric series. A seeded PRNG keeps values identical on
// server and client so there's no hydration mismatch and no random flicker.

export type DayPoint = {
  date: string; // ISO yyyy-mm-dd
  label: string; // "Apr 3"
  mrr: number;
  users: number;
  signups: number;
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildSeries(): DayPoint[] {
  const rand = mulberry32(20260705);
  const days = 90;
  const points: DayPoint[] = [];

  let mrr = 96000;
  let users = 7400;

  // Fixed reference "today" so the build is reproducible (no Date.now()).
  const end = new Date(Date.UTC(2026, 6, 4)); // 2026-07-04

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);

    // Upward drift with weekly seasonality + noise.
    const dow = d.getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 0.55 : 1;
    const growth = 1 + (rand() * 0.9 + 0.35) / 100; // ~0.35–1.25% daily
    mrr = Math.round(mrr * growth);
    const userGrowth = 1 + (rand() * 0.5 + 0.12) / 100;
    users = Math.round(users * userGrowth);
    const signups = Math.round((rand() * 60 + 40) * weekend);

    points.push({
      date: d.toISOString().slice(0, 10),
      label: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`,
      mrr,
      users,
      signups,
    });
  }

  return points;
}

export const SERIES: DayPoint[] = buildSeries();

export function sliceRange(days: 7 | 30 | 90): DayPoint[] {
  return SERIES.slice(-days);
}

export type Kpi = {
  key: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number; // percentage points / percent change
  direction: "up" | "down";
  positiveIsGood: boolean;
  spark: number[];
};

const last30 = SERIES.slice(-30);
const SPARKS: Record<string, number[]> = {
  mrr: last30.map((d) => d.mrr),
  users: last30.map((d) => d.users),
  churn: last30.map((_, i) => 2.25 - i * 0.014 + (i % 3) * 0.03),
  nrr: last30.map((_, i) => 108 + i * 0.14 + (i % 4) * 0.05),
};

export const KPIS: Kpi[] = [
  {
    key: "mrr",
    label: "Monthly Recurring Revenue",
    value: 128400,
    format: "currency",
    delta: 14.2,
    direction: "up",
    positiveIsGood: true,
    spark: SPARKS.mrr,
  },
  {
    key: "users",
    label: "Active Users",
    value: 8932,
    format: "number",
    delta: 6.7,
    direction: "up",
    positiveIsGood: true,
    spark: SPARKS.users,
  },
  {
    key: "churn",
    label: "Churn Rate",
    value: 1.8,
    format: "percent",
    delta: 0.3,
    direction: "down",
    positiveIsGood: false,
    spark: SPARKS.churn,
  },
  {
    key: "nrr",
    label: "Net Revenue Retention",
    value: 112,
    format: "percent",
    delta: 2.1,
    direction: "up",
    positiveIsGood: true,
    spark: SPARKS.nrr,
  },
];

export type Channel = { name: string; value: number; color: string };

export const CHANNELS: Channel[] = [
  { name: "Organic", value: 42, color: "#5B8DEF" },
  { name: "Referral", value: 26, color: "#3FD68C" },
  { name: "Paid", value: 20, color: "#F5A623" },
  { name: "Direct", value: 12, color: "#8B5BEF" },
];
