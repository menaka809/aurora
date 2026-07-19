export type Status = "active" | "trial" | "churned" | "past_due";

export type Customer = {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Growth" | "Scale" | "Enterprise";
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

const NAMES = [
  "Ava Bennett", "Liam Ortiz", "Noah Fischer", "Maya Kapoor", "Ethan Cole",
  "Sofia Marchetti", "Lucas Brandt", "Isabel Vega", "Owen Nakamura", "Chloe Duarte",
  "Mateo Ricci", "Zoe Hendricks", "Elias Novak", "Priya Raman", "Jonas Weber",
  "Amara Okafor", "Felix Lindqvist", "Nina Petrova", "Caleb Yoon", "Léa Moreau",
  "Diego Salcedo", "Hana Suzuki", "Marcus Reid", "Yara Haddad", "Theo Larsen",
  "Emilia Costa", "Rohan Mehta", "Greta Falk", "Sam Whitfield", "Aria Delgado",
  "Viktor Ilic", "Nadia Rahman", "Oscar Lindberg", "Freya Ronson", "Kai Andersson",
];

const PLANS: Customer["plan"][] = ["Starter", "Growth", "Scale", "Enterprise"];
const STATUSES: Status[] = [
  "active", "active", "active", "trial", "active",
  "past_due", "active", "churned", "trial", "active",
];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCustomers(): Customer[] {
  const rand = mulberry32(7788);
  return NAMES.map((name, i) => {
    const plan = PLANS[Math.floor(rand() * PLANS.length)];
    const base =
      plan === "Enterprise" ? 1800 : plan === "Scale" ? 640 : plan === "Growth" ? 240 : 60;
    const mrr = Math.round(base * (0.7 + rand() * 0.9));
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const year = 2025;
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 27);
    const seats = 1 + Math.floor(rand() * (plan === "Enterprise" ? 120 : 24));
    const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
    return {
      id: `cus_${(1000 + i).toString(36)}`,
      name,
      email: `${handle}@${["acme.co", "northwind.io", "vertex.app", "lumen.dev"][i % 4]}`,
      plan,
      mrr: status === "churned" ? 0 : mrr,
      status,
      joined: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      seats,
    };
  });
}

export const CUSTOMERS: Customer[] = buildCustomers();

/** Deterministic avatar colour from a name. */
export function avatarColor(name: string): string {
  const palette = ["#5B8DEF", "#3FD68C", "#F5A623", "#8B5BEF", "#F2555A", "#37C0C4"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

// ---- Rich profile (deterministic per customer) ----

const REF = Date.UTC(2026, 6, 4); // fixed "today" for reproducibility
const DAY = 86400000;
const PLAN_BASE: Record<Customer["plan"], number> = {
  Starter: 60,
  Growth: 240,
  Scale: 640,
  Enterprise: 1800,
};
const MANAGERS = ["Priya Raman", "Marcus Reid", "Elena Fischer", "Sam Whitfield"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function monthsSince(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const start = Date.UTC(y, m - 1, d);
  return Math.max(1, Math.round((REF - start) / (DAY * 30.44)));
}

function isoFromDaysAgo(days: number): string {
  return new Date(REF - days * DAY).toISOString().slice(0, 10);
}

export type Payment = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "refunded" | "failed";
  invoice: string;
};

export type TimelineKind = "signup" | "payment" | "upgrade" | "login" | "ticket";
export type TimelineEvent = {
  id: string;
  kind: TimelineKind;
  title: string;
  meta?: string;
  date: string;
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
  tags: string[];
  payments: Payment[];
  timeline: TimelineEvent[];
  tickets: Ticket[];
  notes: Note[];
};

export function getProfile(c: Customer): CustomerProfile {
  const rand = mulberry32(hashStr(c.id));
  const tenure = monthsSince(c.joined);
  const monthly = c.mrr || PLAN_BASE[c.plan];
  const ltv = Math.round(monthly * tenure * (0.9 + rand() * 0.35));
  const lastLoginDays =
    c.status === "churned"
      ? 20 + Math.floor(rand() * 60)
      : Math.floor(rand() * 4);

  const manager = MANAGERS[hashStr(c.name) % MANAGERS.length];

  const tags: string[] = [c.plan];
  if (monthly >= 1000) tags.push("High value");
  if (c.seats >= 50) tags.push("Power user");
  if (c.status === "past_due") tags.push("At risk");
  if (c.status === "trial") tags.push("In trial");
  if (tenure <= 3 && c.status !== "churned") tags.push("New");
  if (c.status === "churned") tags.push("Won-back target");

  // Payments — monthly invoices going back from now.
  const count = Math.min(tenure, 6);
  const payments: Payment[] = Array.from({ length: count }).map((_, i) => {
    const failed = c.status === "past_due" && i === 0;
    return {
      id: `in_${c.id}_${i}`,
      date: isoFromDaysAgo(i * 30 + 4),
      amount: monthly,
      status: failed ? "failed" : rand() < 0.06 ? "refunded" : "paid",
      invoice: `INV-${2600 - i}${(hashStr(c.id) % 90) + 10}`,
    };
  });

  // Support tickets.
  const ticketCount = Math.floor(rand() * 3);
  const SUBJECTS = [
    "SSO configuration help",
    "Invoice discrepancy",
    "API rate limit increase",
    "Seat management question",
    "Data export request",
  ];
  const tickets: Ticket[] = Array.from({ length: ticketCount }).map((_, i) => ({
    id: `tk_${c.id}_${i}`,
    subject: SUBJECTS[Math.floor(rand() * SUBJECTS.length)],
    status: rand() < 0.5 ? "resolved" : "open",
    priority: (["Low", "Normal", "High"] as const)[Math.floor(rand() * 3)],
    date: isoFromDaysAgo(Math.floor(rand() * 90) + 2),
  }));

  // Activity timeline (most recent first).
  const timeline: TimelineEvent[] = [];
  timeline.push({
    id: `ev_login_${c.id}`,
    kind: "login",
    title: "Signed in to the app",
    date: isoFromDaysAgo(lastLoginDays),
  });
  payments.slice(0, 2).forEach((p, i) =>
    timeline.push({
      id: `ev_pay_${c.id}_${i}`,
      kind: "payment",
      title: p.status === "failed" ? "Payment failed" : "Invoice paid",
      meta: `$${p.amount.toLocaleString("en-US")}`,
      date: p.date,
    })
  );
  if (rand() < 0.5)
    timeline.push({
      id: `ev_up_${c.id}`,
      kind: "upgrade",
      title: `Upgraded to the ${c.plan} plan`,
      date: isoFromDaysAgo(Math.floor(tenure * 12)),
    });
  if (tickets[0])
    timeline.push({
      id: `ev_tk_${c.id}`,
      kind: "ticket",
      title: `Opened ticket · ${tickets[0].subject}`,
      date: tickets[0].date,
    });
  timeline.push({
    id: `ev_signup_${c.id}`,
    kind: "signup",
    title: `Signed up on the ${c.plan} plan`,
    date: c.joined,
  });
  timeline.sort((a, b) => (a.date < b.date ? 1 : -1));

  const notes: Note[] = [
    {
      id: `n_${c.id}_0`,
      author: manager,
      text:
        c.status === "past_due"
          ? "Payment bounced — reaching out to update the card on file."
          : c.status === "churned"
          ? "Left after a reorg. Good candidate for a win-back sequence in Q3."
          : "Expansion conversation going well — evaluating an additional team.",
      date: isoFromDaysAgo(Math.floor(rand() * 20) + 3),
    },
  ];

  return {
    ...c,
    ltv,
    tenureMonths: tenure,
    lastLoginDays,
    manager,
    tags,
    payments,
    timeline,
    tickets,
    notes,
  };
}
