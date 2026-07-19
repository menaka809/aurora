"use client";

import { motion } from "framer-motion";
import { formatNumber } from "@/lib/format";
import { FUNNEL } from "@/lib/insights";

export default function ConversionFunnel() {
  const max = FUNNEL[0].value;

  return (
    <div className="space-y-5 p-5 pt-2">
      {FUNNEL.map((s, i) => {
        const width = (s.value / max) * 100;
        const conv = i > 0 ? (s.value / FUNNEL[i - 1].value) * 100 : 100;
        return (
          <div key={s.stage}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-fg">{s.stage}</span>
              <span className="flex items-baseline gap-3">
                <span className="tabular font-medium text-fg">
                  {formatNumber(s.value)}
                </span>
                {i > 0 && (
                  <span className="tabular w-12 text-right text-xs text-muted">
                    {conv.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-elevated">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${width}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #5B8DEF, #3FD68C)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
