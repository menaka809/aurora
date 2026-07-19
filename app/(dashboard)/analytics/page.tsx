"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { sliceRange } from "@/lib/metrics";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardHeader } from "@/components/Card";
import Segmented from "@/components/Segmented";
import AreaTrend from "@/components/charts/AreaTrend";
import ConversionFunnel from "@/components/ConversionFunnel";
import PlanBreakdown from "@/components/PlanBreakdown";

type Range = "7" | "30" | "90";

function HeadlineStat({ value, delta }: { value: string; delta: number }) {
  const up = delta >= 0;
  return (
    <div className="text-right">
      <p className="tabular text-lg font-semibold text-fg">{value}</p>
      <p
        className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
          up ? "text-success" : "text-danger"
        }`}
      >
        {up ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {Math.abs(delta).toFixed(1)}%
      </p>
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<Range>("30");
  const data = sliceRange(Number(range) as 7 | 30 | 90);
  const rows = data as unknown as Record<string, unknown>[];

  const revStart = data[0].mrr;
  const revEnd = data[data.length - 1].mrr;
  const revDelta = ((revEnd - revStart) / revStart) * 100;

  const usrStart = data[0].users;
  const usrEnd = data[data.length - 1].users;
  const usrDelta = ((usrEnd - usrStart) / usrStart) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-[1400px] space-y-4"
    >
      {/* Range control (applies to the time-series charts) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Showing the last <span className="text-fg">{range} days</span>
        </p>
        <Segmented
          idBase="analytics-range"
          value={range}
          onChange={setRange}
          options={[
            { label: "7D", value: "7" },
            { label: "30D", value: "30" },
            { label: "90D", value: "90" },
          ]}
        />
      </div>

      {/* Q: Is recurring revenue growing? */}
      <Card>
        <CardHeader
          title="Recurring revenue"
          subtitle="Total MRR booked per day"
          info="MRR (Monthly Recurring Revenue) is the predictable subscription revenue billed each month, excluding one-off charges."
          action={<HeadlineStat value={formatCurrency(revEnd)} delta={revDelta} />}
        />
        <div className="px-3 pb-4 pt-6">
          <AreaTrend
            data={rows}
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
          subtitle="Daily active accounts"
          info="Active users are unique accounts with at least one session on a given day."
          action={<HeadlineStat value={formatNumber(usrEnd)} delta={usrDelta} />}
        />
        <div className="px-3 pb-4 pt-6">
          <AreaTrend
            data={rows}
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
            subtitle="Where visitors drop off before paying"
            info="Each stage's percentage is its conversion from the stage directly above it."
          />
          <ConversionFunnel />
        </Card>
        <Card>
          <CardHeader
            title="Revenue by plan"
            subtitle="Share of MRR by subscription tier"
            info="How total Monthly Recurring Revenue splits across your plan tiers."
          />
          <PlanBreakdown />
        </Card>
      </div>
    </motion.div>
  );
}
