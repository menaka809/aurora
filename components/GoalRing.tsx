"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";
import { formatCurrency } from "@/lib/format";
import type { Goal } from "@/lib/data/types";

export default function GoalRing({ goal }: { goal: Goal }) {
  const pct = Math.min(100, (goal.current / goal.target) * 100);
  const shown = useCountUp(pct, { duration: 1600, delay: 300 });

  const r = 68;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke="url(#goal-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * pct) / 100 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
          <defs>
            <linearGradient id="goal-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5B8DEF" />
              <stop offset="100%" stopColor="#3FD68C" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-3xl font-semibold tracking-tight text-fg">
            {shown.toFixed(0)}%
          </span>
          <span className="text-[11px] text-muted-foreground">of goal</span>
        </div>
      </div>
      <div className="mt-4 flex w-full items-center justify-between text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="tabular font-medium text-fg">
            {formatCurrency(goal.current)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="tabular font-medium text-fg">
            {formatCurrency(goal.target)}
          </p>
        </div>
      </div>
    </div>
  );
}
