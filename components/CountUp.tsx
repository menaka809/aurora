"use client";

import { useCountUp } from "@/lib/useCountUp";
import { formatValue } from "@/lib/format";

/**
 * A number that morphs to its new value when it changes (e.g. switching the
 * reporting period). Server HTML already contains the real value.
 */
export default function CountUp({
  value,
  format,
  delay = 0,
}: {
  value: number;
  format: "currency" | "number" | "percent" | "wholePercent";
  delay?: number;
}) {
  const shown = useCountUp(value, { delay });
  return <>{format === "wholePercent" ? `${shown.toFixed(0)}%` : formatValue(shown, format)}</>;
}
