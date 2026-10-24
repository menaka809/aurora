// Synthetic daily metrics. Every value is a pure function of its calendar day,
// so the chart window can end "today" while past days never change.

import { hashStr, mulberry32 } from "./random";
import { DAY_MS, toISO } from "./time";
import { MONTHS } from "./format";

export type DayPoint = {
  date: string; // ISO yyyy-mm-dd
  label: string; // "Apr 3"
  mrr: number;
  users: number;
  signups: number;
  churn: number; // % of customers lost per month
  nrr: number; // net revenue retention, %
};

// Day 0 of the fictional business.
const EPOCH = Date.UTC(2024, 0, 1);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function pointFor(dayMs: number): DayPoint {
  const t = Math.round((dayMs - EPOCH) / DAY_MS);
  const date = toISO(dayMs);
  const rand = mulberry32(hashStr(date));
  const jitter = () => rand() * 2 - 1; // -1..1
  const d = new Date(dayMs);
  const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;

  // ~4% month-over-month growth with a gentle wobble.
  const mrr = Math.round(
    33_700 * Math.exp(0.0013 * t) * (1 + 0.004 * Math.sin(t / 11) + 0.002 * jitter())
  );
  const users = Math.round(
    3_530 * Math.exp(0.0009 * t) * (weekend ? 0.97 : 1) * (1 + 0.008 * jitter())
  );
  const signups = Math.round((6 + 6 * rand()) * (weekend ? 0.55 : 1) * (1 + t / 1500));
  const churn = clamp(2.6 - 0.0008 * t + 0.05 * Math.sin(t / 17) + 0.03 * jitter(), 0.8, 5);
  const nrr = clamp(103 + 0.0088 * t + 0.4 * Math.sin(t / 13) + 0.2 * jitter(), 95, 130);

  return {
    date,
    label: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`,
    mrr,
    users,
    signups,
    churn: Math.round(churn * 100) / 100,
    nrr: Math.round(nrr * 10) / 10,
  };
}

/** `days` consecutive points ending on `endMs` (inclusive). */
export function seriesEnding(endMs: number, days: number): DayPoint[] {
  return Array.from({ length: days }, (_, i) => pointFor(endMs - (days - 1 - i) * DAY_MS));
}

/** Percent change from the first to the last value. */
export function pctChange(first: number, last: number): number {
  return ((last - first) / first) * 100;
}

export type Channel = { name: string; value: number; color: string };

export const CHANNELS: Channel[] = [
  { name: "Organic", value: 42, color: "#5B8DEF" },
  { name: "Referral", value: 26, color: "#3FD68C" },
  { name: "Paid", value: 20, color: "#F5A623" },
  { name: "Direct", value: 12, color: "#8B5BEF" },
];
