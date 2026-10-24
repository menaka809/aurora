// Column ids and labels for the customers table. Plain data (no React), so
// both the client table and the server-rendered print report can use it.

export const COLUMN_LABELS: Record<string, string> = {
  name: "Customer",
  plan: "Plan",
  mrr: "MRR",
  status: "Status",
  lastSeen: "Last seen",
  seats: "Seats",
  joined: "Joined",
  ltv: "Lifetime value",
  manager: "Manager",
  tags: "Tags",
};

/** Default left-to-right order of every column. */
export const DEFAULT_ORDER = [
  "select", "name", "plan", "mrr", "status", "lastSeen", "seats", "joined", "ltv", "manager", "tags",
];

/** Columns pinned to the start; they don't drag and can't be hidden. */
export const PINNED = ["select", "name"];

/** Default width of each column, in px. */
export const COLUMN_SIZES: Record<string, number> = {
  select: 44,
  name: 260,
  plan: 120,
  mrr: 120,
  status: 140,
  lastSeen: 140,
  seats: 110,
  joined: 150,
  ltv: 150,
  manager: 160,
  tags: 200,
};

/** Narrowest a column can be resized to while its content stays readable. */
export const COLUMN_MIN_SIZES: Record<string, number> = {
  select: 44,
  name: 200,
  plan: 100,
  mrr: 100,
  status: 120,
  lastSeen: 110,
  seats: 80,
  joined: 130,
  ltv: 120,
  manager: 130,
  tags: 140,
};

export const COLUMN_MAX_SIZE = 560;

/** Columns that can be printed or exported, in default order. */
export const DATA_COLUMNS = DEFAULT_ORDER.filter((id) => id !== "select");
