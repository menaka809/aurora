export const DAY_MS = 86_400_000;

/** Midnight UTC of the current day, as epoch milliseconds. */
export function todayUTC(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Epoch ms → "yyyy-mm-dd". */
export function toISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** "yyyy-mm-dd" → epoch ms at midnight UTC. */
export function fromISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole days from `iso` until `refMs` (positive = in the past). */
export function daysBefore(iso: string, refMs: number): number {
  return Math.round((refMs - fromISO(iso)) / DAY_MS);
}
