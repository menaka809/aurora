"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";
import { formatValue } from "@/lib/format";
import Sparkline from "./charts/Sparkline";
import type { Kpi } from "@/lib/data/types";

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const value = useCountUp(kpi.value, { duration: 1500, delay: 250 + index * 90 });
  const isUp = kpi.direction === "up";
  const good = isUp === kpi.positiveIsGood;

  return (
    <motion.div
      variants={item}
      className="glass theme-tint relative overflow-hidden rounded-xl border border-border p-5"
    >
      {/* faint gradient wash under the glass */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-2xl"
        style={{
          background: good
            ? "radial-gradient(circle, var(--success), transparent 70%)"
            : "radial-gradient(circle, var(--primary), transparent 70%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="text-xs text-muted-foreground">{kpi.label}</span>
        <span
          className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular ${
            good ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}
        >
          {isUp ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {kpi.delta}
          {kpi.deltaUnit === "%" ? "%" : " pts"}
        </span>
      </div>

      <div className="relative mt-3 tabular text-3xl font-semibold tracking-tight text-fg">
        {formatValue(value, kpi.format)}
      </div>

      <Sparkline
        data={kpi.spark}
        color={good ? "#3FD68C" : "#5B8DEF"}
        className="mt-4 h-8 w-full"
      />
    </motion.div>
  );
}
