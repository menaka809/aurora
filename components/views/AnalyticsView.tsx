"use client";

import { motion } from "framer-motion";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardHeader } from "@/components/Card";
import AreaTrend from "@/components/charts/AreaTrend";
import ConversionFunnel from "@/components/ConversionFunnel";
import PlanBreakdown from "@/components/PlanBreakdown";
import RangeBar, { useRange } from "@/components/RangeBar";
import DeltaBadge from "@/components/DeltaBadge";
import type { Range } from "@/lib/range";
import type { DayPoint, FunnelStage, Kpi, PlanSlice } from "@/lib/data/types";

/** Big number plus its change vs the previous period. */
function HeadlineStat({ value, kpi, range }: { value: string; kpi: Kpi; range: Range }) {
  const up = kpi.direction === "up";
  return (
    <div className="flex flex-col items-end gap-1">
      <p className="tabular text-lg font-semibold text-fg">{value}</p>
      <DeltaBadge
        value={kpi.delta}
        up={up}
        good={up === kpi.positiveIsGood}
        title={`vs previous ${range} days`}
      />
    </div>
  );
}

export default function AnalyticsView({
  range: serverRange,
  series,
  kpis,
  funnel,
  plans,
}: {
  range: Range;
  series: DayPoint[];
  kpis: Kpi[];
  funnel: FunnelStage[];
  plans: PlanSlice[];
}) {
  const { range, pending, change } = useRange(serverRange);
  const mrr = kpis.find((k) => k.key === "mrr")!;
  const users = kpis.find((k) => k.key === "users")!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-[1400px] space-y-4"
    >
      <RangeBar range={range} pending={pending} onChange={change} />

      <div
        aria-busy={pending}
        className={`space-y-4 transition-opacity ${pending ? "opacity-60" : ""}`}
      >
        {/* Q: Is recurring revenue growing? */}
        <Card>
          <CardHeader
            title="Recurring revenue"
            subtitle={`MRR over time · last ${serverRange} days`}
            info="MRR (Monthly Recurring Revenue) is the predictable subscription revenue billed each month, excluding one-off charges."
            action={<HeadlineStat value={formatCurrency(mrr.value)} kpi={mrr} range={serverRange} />}
          />
          <div className="px-3 pb-4 pt-6">
            <AreaTrend
              data={series}
              dataKey="mrr"
              name="MRR"
              color="#5B8DEF"
              formatter={(v) => formatCurrency(v)}
              compact={(v) => formatCurrency(v, true)}
              height={300}
              animationBegin={0}
              animationDuration={800}
            />
          </div>
        </Card>

        {/* Q: Is the active audience growing? */}
        <Card>
          <CardHeader
            title="User growth"
            subtitle={`Daily active accounts · last ${serverRange} days`}
            info="Active users are unique accounts with at least one session on a given day."
            action={
              <HeadlineStat value={formatNumber(users.value)} kpi={users} range={serverRange} />
            }
          />
          <div className="px-3 pb-4 pt-6">
            <AreaTrend
              data={series}
              dataKey="users"
              name="Active users"
              color="#3FD68C"
              formatter={(v) => formatNumber(v)}
              compact={(v) => formatNumber(v, true)}
              height={260}
              animationBegin={0}
              animationDuration={800}
            />
          </div>
        </Card>

        {/* Q: Where do we lose people / which plans pay? */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Conversion funnel"
              subtitle={`Where visitors drop off before paying · last ${serverRange} days`}
              info="Each stage's percentage is its conversion from the stage directly above it."
            />
            <ConversionFunnel stages={funnel} />
          </Card>
          <Card>
            <CardHeader
              title="Revenue by plan"
              subtitle="Share of current MRR by subscription tier"
              info="How total Monthly Recurring Revenue splits across your plan tiers today."
            />
            <PlanBreakdown data={plans} />
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
