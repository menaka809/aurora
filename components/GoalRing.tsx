import CountUp from "./CountUp";
import { formatCurrency } from "@/lib/format";
import type { Goal } from "@/lib/data/types";

/** Quarterly MRR goal ring. Server-rendered; the arc animates with a CSS transition. */
export default function GoalRing({ goal }: { goal: Goal }) {
  const pct = Math.min(100, (goal.current / goal.target) * 100);
  const r = 68;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <div
        role="img"
        aria-label={`${pct.toFixed(0)}% of the quarterly MRR goal`}
        className="relative h-[180px] w-[180px]"
      >
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="80" cy="80" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke="url(#goal-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * pct) / 100}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="goal-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--chart-1)" }} />
              <stop offset="100%" style={{ stopColor: "var(--chart-2)" }} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
          <span className="tabular text-3xl font-semibold tracking-tight text-fg">
            <CountUp value={pct} format="wholePercent" />
          </span>
          <span className="text-[11px] text-muted-foreground">of goal</span>
        </div>
      </div>
      <div className="mt-4 flex w-full items-center justify-between text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="tabular font-medium text-fg">{formatCurrency(goal.current)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="tabular font-medium text-fg">{formatCurrency(goal.target)}</p>
        </div>
      </div>
    </div>
  );
}
