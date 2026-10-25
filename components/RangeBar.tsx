"use client";

import { useOptimistic, useTransition } from "react";
import { useQueryState } from "nuqs";
import { CalendarRange, Loader2 } from "lucide-react";
import Segmented from "@/components/Segmented";
import { RANGE_COOKIE, RANGES, rangeParser, type Range } from "@/lib/range";

/**
 * The shared reporting period. Changing it updates the URL (shareable),
 * remembers it in a cookie (so Overview and Analytics stay in sync), and
 * re-renders the page on the server. The new choice shows immediately while
 * the data loads.
 */
export function useRange(range: Range) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(range);
  const [, setParam] = useQueryState(
    "range",
    rangeParser.withOptions({ shallow: false, scroll: false, startTransition })
  );

  const change = (next: Range) => {
    document.cookie = `${RANGE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      setShown(next);
      void setParam(next);
    });
  };

  return { range: shown, pending, change };
}

export default function RangeBar({
  range,
  pending,
  onChange,
}: {
  range: Range;
  pending: boolean;
  onChange: (r: Range) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarRange className="size-4 shrink-0" />
        <span>
          <span className="font-medium text-fg">Last {range} days</span>
          <span className="hidden sm:inline"> · compared with the previous {range} days</span>
        </span>
        {pending && (
          <Loader2 aria-label="Updating" className="size-3.5 animate-spin text-primary" />
        )}
      </p>
      <Segmented
        idBase="reporting-range"
        value={String(range)}
        onChange={(v) => onChange(Number(v) as Range)}
        options={RANGES.map((r) => ({ label: `${r}D`, value: String(r) }))}
      />
    </div>
  );
}
