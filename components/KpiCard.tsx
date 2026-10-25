import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import CountUp from "./CountUp";
import Sparkline from "./charts/Sparkline";
import type { Kpi } from "@/lib/data/types";

/** Headline metric card. Server-rendered; only the number is a client island. */
export default function KpiCard({
  kpi,
  index,
  range,
}: {
  kpi: Kpi;
  index: number;
  /** Comparison period in days, shown as "vs previous N days". */
  range: number;
}) {
  const isUp = kpi.direction === "up";
  const good = isUp === kpi.positiveIsGood;

  return (
    <div
      className="rise glass theme-tint relative overflow-hidden rounded-xl border border-border p-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* faint gradient wash under the glass */}
      <div
        aria-hidden
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
          title={`vs previous ${range} days`}
          className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular ${
            good ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}
        >
          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {kpi.delta}
          {kpi.deltaUnit === "%" ? "%" : " pts"}
        </span>
      </div>

      <div className="relative mt-3 tabular text-3xl font-semibold tracking-tight text-fg">
        <CountUp value={kpi.value} format={kpi.format} delay={index * 60} />
      </div>
      <p className="relative mt-1 text-[11px] text-muted-foreground">vs previous {range} days</p>

      <Sparkline
        data={kpi.spark}
        color={good ? "var(--chart-2)" : "var(--chart-1)"}
        className="mt-4 h-8 w-full"
      />
    </div>
  );
}
