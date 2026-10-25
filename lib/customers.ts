import { hashStr, mulberry32 } from "./random";
import { DAY_MS, fromISO, toISO } from "./time";

export type Status = "active" | "trial" | "churned" | "past_due";
export type Plan = "Starter" | "Growth" | "Scale" | "Enterprise";

export const PLANS: Plan[] = ["Starter", "Growth", "Scale", "Enterprise"];

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: Plan;
  /** What the account pays per month on its plan. */
  listPrice: number;
  /** Counts toward MRR: listPrice for paying accounts, 0 for trials and churned. */
  mrr: number;
  status: Status;
  joined: string; // ISO
  seats: number;
};

export const STATUS_LABEL: Record<Status, string> = {
  active: "Active",
  trial: "Trial",
  churned: "Churned",
  past_due: "Past due",
};

const FIRST = [
  "Ava", "Liam", "Noah", "Maya", "Ethan", "Sofia", "Lucas", "Isabel", "Owen", "Chloe",
  "Mateo", "Zoe", "Elias", "Priya", "Jonas", "Amara", "Felix", "Nina", "Caleb", "Léa",
  "Diego", "Hana", "Marcus", "Yara", "Theo", "Emilia", "Rohan", "Greta", "Sam", "Aria",
  "Viktor", "Nadia", "Oscar", "Freya", "Kai", "Lena", "Arjun", "Ines", "Hugo", "Mila",
];
const LAST = [
  "Bennett", "Ortiz", "Novak", "Kapoor", "Cole", "Marchetti", "Brandt", "Vega", "Nakamura", "Duarte",
  "Ricci", "Hendricks", "Raman", "Weber", "Okafor", "Lindqvist", "Petrova", "Yoon", "Moreau", "Salcedo",
  "Suzuki", "Reid", "Haddad", "Larsen", "Costa", "Mehta", "Falk", "Whitfield", "Delgado", "Ilic",
  "Rahman", "Lindberg", "Ronson", "Andersson", "Varga", "Ibarra", "Schultz", "Tanaka", "Oyelaran", "Quinn",
];
const CO_A = [
  "Northwind", "Brightline", "Kestrel", "Halcyon", "Pinecrest", "Lumen", "Vertex", "Bluebird",
  "Quarry", "Ember", "Saltmarsh", "Fieldstone", "Copperleaf", "Driftwood", "Ironbark", "Meridian",
  "Silverpine", "Tidewater", "Granite", "Juniper", "Harbor", "Larkspur", "Summit", "Willow",
];
const CO_B = [
  "Labs", "Health", "Freight", "Analytics", "Studio", "Logistics", "Systems", "Supply",
  "Finance", "Robotics", "Media", "Energy",
];

// Account managers are staff, so keep them out of the customer name space.
export const MANAGERS = ["Elena Fischer", "Tom Alvarez", "Grace Lin", "Rafael Souza"];

/** Account-health signals used for filtering and the "At risk"-style views. */
export type Health = "at_risk" | "high_value" | "new" | "win_back";
export const HEALTH_LABEL: Record<Health, string> = {
  at_risk: "At risk",
  high_value: "High value",
  new: "New",
  win_back: "Win-back target",
};

const PLAN_BASE: Record<Plan, number> = {
  Starter: 79,
  Growth: 290,
  Scale: 790,
  Enterprise: 2400,
};
const SEATS: Record<Plan, [number, number]> = {
  Starter: [1, 5],
  Growth: [3, 25],
  Scale: [8, 60],
  Enterprise: [20, 180],
};

function weighted<T>(rand: () => number, items: [T, number][]): T {
  let r = rand();
  for (const [item, w] of items) {
    if ((r -= w) < 0) return item;
  }
  return items[items.length - 1][0];
}

function slug(s: string, sep: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, sep);
}

const isPaying = (s: Status) => s === "active" || s === "past_due";

/**
 * Builds the customer book. Names, plans and statuses are fixed by the seed;
 * join dates are relative to `todayMs`, and prices are scaled so the paying
 * accounts add up exactly to `targetMrr` (the dashboard's MRR KPI).
 */
export function buildCustomers(todayMs: number, targetMrr: number, count = 120): Customer[] {
  const rand = mulberry32(7788);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const usedNames = new Set(MANAGERS);
  const usedCompanies = new Set<string>();

  const drafts = Array.from({ length: count }, (_, i) => {
    let name: string;
    do name = `${pick(FIRST)} ${pick(LAST)}`;
    while (usedNames.has(name));
    usedNames.add(name);

    let company: string;
    do company = `${pick(CO_A)} ${pick(CO_B)}`;
    while (usedCompanies.has(company));
    usedCompanies.add(company);

    const plan = weighted<Plan>(rand, [
      ["Starter", 0.34],
      ["Growth", 0.32],
      ["Scale", 0.22],
      ["Enterprise", 0.12],
    ]);
    const status = weighted<Status>(rand, [
      ["active", 0.7],
      ["trial", 0.08],
      ["past_due", 0.08],
      ["churned", 0.14],
    ]);
    // Trials are by definition recent; everyone else joined 1–25 months ago.
    const joinedDaysAgo =
      status === "trial" ? 1 + Math.floor(rand() * 13) : 30 + Math.floor(rand() * 730);
    const raw = PLAN_BASE[plan] * (0.7 + rand() * 0.9);
    const [lo, hi] = SEATS[plan];
    const seats = lo + Math.floor(rand() * (hi - lo + 1));

    return {
      id: `cus_${(1000 + i).toString(36)}`,
      name,
      email: `${slug(name, ".")}@${slug(company, "")}.example`,
      company,
      plan,
      status,
      joined: toISO(todayMs - joinedDaysAgo * DAY_MS),
      seats,
      raw,
    };
  });

  const payingRaw = drafts.filter((d) => isPaying(d.status)).reduce((s, d) => s + d.raw, 0);
  const factor = targetMrr / payingRaw;

  const customers: Customer[] = drafts.map(({ raw, ...d }) => {
    const listPrice = Math.max(1, Math.round(raw * factor));
    return { ...d, listPrice, mrr: isPaying(d.status) ? listPrice : 0 };
  });

  // Absorb rounding so the book matches the KPI to the dollar.
  const drift = targetMrr - customers.reduce((s, c) => s + c.mrr, 0);
  const largest = customers.reduce((a, b) => (b.mrr > a.mrr ? b : a));
  largest.mrr += drift;
  largest.listPrice = largest.mrr;

  return customers;
}

/** Deterministic avatar colour from a name. */
export function avatarColor(name: string): string {
  // Deep enough that white initials pass WCAG AA (each ≥ 4.95:1).
  const palette = ["#3a6ad0", "#0c8051", "#9e630b", "#7c4ddb", "#c9363d", "#0e7c86"];
  return palette[hashStr(name) % palette.length];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ---- Rich profile (deterministic per customer) ----

export type Payment = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "refunded" | "failed";
  invoice: string;
};

export type TimelineKind = "signup" | "payment" | "upgrade" | "login" | "ticket" | "churn";
export type TimelineEvent = {
  id: string;
  kind: TimelineKind;
  title: string;
  meta?: string;
  date: string;
  /** Payment outcome, for payment events. */
  outcome?: Payment["status"];
};

export type Ticket = {
  id: string;
  subject: string;
  status: "open" | "resolved";
  priority: "Low" | "Normal" | "High";
  date: string;
};

export type Note = { id: string; author: string; text: string; date: string };

export type CustomerProfile = Customer & {
  ltv: number;
  tenureMonths: number;
  lastLoginDays: number;
  manager: string;
  health: Health[];
  tags: string[];
  payments: Payment[];
  /** Next invoice date for paying accounts. */
  nextInvoice: string | null;
  timeline: TimelineEvent[];
  tickets: Ticket[];
  notes: Note[];
};

const BILLING_DAYS = 30;
const SUBJECTS = [
  "SSO configuration help",
  "Invoice discrepancy",
  "API rate limit increase",
  "Seat management question",
  "Data export request",
];

export function getProfile(c: Customer, todayMs: number): CustomerProfile {
  const rand = mulberry32(hashStr(c.id));
  const joinedMs = fromISO(c.joined);
  const tenureDays = Math.round((todayMs - joinedMs) / DAY_MS);
  const ago = (days: number) => toISO(todayMs - days * DAY_MS);

  // Churned accounts stopped some time after joining; everything else is ongoing.
  const churnDaysAgo =
    c.status === "churned" ? Math.min(tenureDays - 1, 10 + Math.floor(rand() * 80)) : 0;
  const activeUntil = todayMs - churnDaysAgo * DAY_MS;
  const activeDays = Math.round((activeUntil - joinedMs) / DAY_MS);
  const tenureMonths = Math.max(1, Math.round(activeDays / 30.44));

  // Invoices every 30 days from the join date. Trials haven't been billed yet.
  const invoiceCount = c.status === "trial" ? 0 : Math.floor(activeDays / BILLING_DAYS) + 1;
  const payments: Payment[] = Array.from({ length: Math.min(invoiceCount, 6) }, (_, i) => {
    const k = invoiceCount - 1 - i;
    const date = toISO(joinedMs + k * BILLING_DAYS * DAY_MS);
    const failed = c.status === "past_due" && i === 0;
    return {
      id: `in_${c.id}_${k}`,
      date,
      amount: c.listPrice,
      status: failed ? "failed" : rand() < 0.04 ? "refunded" : "paid",
      invoice: `INV-${date.slice(0, 7).replace("-", "")}-${(hashStr(c.id + k) % 900) + 100}`,
    };
  });
  const paidInvoices = invoiceCount - (c.status === "past_due" ? 1 : 0);
  const ltv = c.listPrice * Math.max(0, paidInvoices);
  const nextInvoice =
    c.status === "active" || c.status === "past_due"
      ? toISO(joinedMs + invoiceCount * BILLING_DAYS * DAY_MS)
      : null;

  // Most live accounts were seen recently; a long tail has gone quiet.
  const lastLoginDays = Math.min(
    tenureDays,
    c.status === "churned"
      ? churnDaysAgo + Math.floor(rand() * 5)
      : Math.floor(rand() ** 3 * 46)
  );
  const manager = MANAGERS[hashStr(c.name) % MANAGERS.length];

  const dormant = c.status === "active" && lastLoginDays >= 21;
  const health: Health[] = [];
  if (c.status === "past_due" || dormant) health.push("at_risk");
  if (c.listPrice >= 2000 && c.status !== "churned") health.push("high_value");
  if (tenureDays <= 90 && c.status !== "churned") health.push("new");
  if (c.status === "churned") health.push("win_back");

  const tags: string[] = [c.plan, ...health.map((h) => HEALTH_LABEL[h])];
  if (c.seats >= 50) tags.push("Power user");
  if (c.status === "trial") tags.push("In trial");

  // Support tickets, opened while the account was active.
  const ticketCount = Math.floor(rand() * 3);
  const tickets: Ticket[] = Array.from({ length: ticketCount }, (_, i) => ({
    id: `tk_${c.id}_${i}`,
    subject: SUBJECTS[Math.floor(rand() * SUBJECTS.length)],
    status: c.status === "churned" || rand() < 0.5 ? "resolved" : "open",
    priority: (["Low", "Normal", "High"] as const)[Math.floor(rand() * 3)],
    date: ago(churnDaysAgo + Math.floor(rand() * Math.max(1, Math.min(90, activeDays)))),
  }));

  // Activity timeline (most recent first).
  const timeline: TimelineEvent[] = [
    {
      id: `ev_login_${c.id}`,
      kind: "login",
      title: "Signed in to the app",
      date: ago(lastLoginDays),
    },
  ];
  payments.slice(0, 2).forEach((p, i) =>
    timeline.push({
      id: `ev_pay_${c.id}_${i}`,
      kind: "payment",
      title:
        p.status === "failed"
          ? "Payment failed"
          : p.status === "refunded"
          ? "Invoice refunded"
          : "Invoice paid",
      meta: `$${p.amount.toLocaleString("en-US")}`,
      date: p.date,
      outcome: p.status,
    })
  );

  // Paid plans above Starter sometimes started one tier lower.
  const upgraded = c.plan !== "Starter" && c.status !== "trial" && activeDays > 60 && rand() < 0.5;
  const startPlan = upgraded ? PLANS[PLANS.indexOf(c.plan) - 1] : c.plan;
  if (upgraded)
    timeline.push({
      id: `ev_up_${c.id}`,
      kind: "upgrade",
      title: `Upgraded to the ${c.plan} plan`,
      meta: c.plan,
      date: ago(churnDaysAgo + Math.floor(rand() * (activeDays - 30))),
    });
  if (tickets[0])
    timeline.push({
      id: `ev_tk_${c.id}`,
      kind: "ticket",
      title: `Opened ticket · ${tickets[0].subject}`,
      date: tickets[0].date,
    });
  if (c.status === "churned")
    timeline.push({
      id: `ev_churn_${c.id}`,
      kind: "churn",
      title: `Cancelled the ${c.plan} plan`,
      meta: c.plan,
      date: ago(churnDaysAgo),
    });
  timeline.push({
    id: `ev_signup_${c.id}`,
    kind: "signup",
    title:
      c.status === "trial"
        ? `Started a ${c.plan} trial`
        : `Signed up on the ${startPlan} plan`,
    meta: startPlan,
    date: c.joined,
  });
  timeline.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const notes: Note[] = [
    {
      id: `n_${c.id}_0`,
      author: manager,
      text:
        c.status === "past_due"
          ? "Payment bounced — reaching out to update the card on file."
          : c.status === "churned"
          ? "Left after a reorg. Good candidate for a win-back sequence next quarter."
          : c.status === "trial"
          ? "Trial kickoff call booked — main goal is replacing their spreadsheet reporting."
          : "Expansion conversation going well — evaluating an additional team.",
      date: ago(Math.min(tenureDays, churnDaysAgo + Math.floor(rand() * 20) + 1)),
    },
  ];

  return {
    ...c,
    ltv,
    tenureMonths,
    lastLoginDays,
    health,
    manager,
    tags,
    payments,
    nextInvoice,
    timeline,
    tickets,
    notes,
  };
}
