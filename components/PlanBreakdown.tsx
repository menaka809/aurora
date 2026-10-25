"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import type { PlanSlice } from "@/lib/data/types";

export default function PlanBreakdown({ data }: { data: PlanSlice[] }) {

  return (
    <div className="space-y-5 p-5 pt-2">
      {data.map((p, i) => (
        <div key={p.plan}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-fg">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: p.color }}
              />
              {p.plan}
            </span>
            <span className="flex items-baseline gap-3">
              <span className="tabular font-medium text-fg">
                {formatCurrency(p.mrr)}
              </span>
              <span className="tabular w-10 text-right text-xs text-muted-foreground">
                {p.pct.toFixed(0)}%
              </span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-elevated">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${p.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              className="h-full rounded-full"
              style={{ background: p.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
