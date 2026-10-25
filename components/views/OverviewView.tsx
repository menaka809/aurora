"use client";

import { motion, type Variants } from "framer-motion";
import { formatCurrency, formatNumber } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import { Card, CardHeader } from "@/components/Card";
import AreaTrend from "@/components/charts/AreaTrend";
import ChannelDonut from "@/components/charts/ChannelDonut";
import ActivityFeed from "@/components/ActivityFeed";
import GoalRing from "@/components/GoalRing";
import RangeBar, { useRange } from "@/components/RangeBar";
import DeltaBadge from "@/components/DeltaBadge";
import type { Range } from "@/lib/range";
import type { Acquisition, ActivityItem, DayPoint, Goal, Kpi } from "@/lib/data/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function OverviewView({
  range: serverRange,
  kpis,
  series,
  acquisition,
  activity,
  goal,
}: {
  range: Range;
  kpis: Kpi[];
  series: DayPoint[];
  acquisition: Acquisition;
  activity: ActivityItem[];
  goal: Goal;
}) {
  const { range, pending, change } = useRange(serverRange);
  const mrr = kpis.find((k) => k.key === "mrr")!;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-[1400px] space-y-4 md:space-y-5"
    >
      <motion.div variants={rise}>
        <RangeBar range={range} pending={pending} onChange={change} />
      </motion.div>

      {/* Everything below follows the selected period; dim it while it reloads. */}
      <div
        aria-busy={pending}
        className={`space-y-4 transition-opacity md:space-y-5 ${pending ? "opacity-60" : ""}`}
      >
        {/* KPI cards */}
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.key} kpi={kpi} index={i} range={serverRange} />
          ))}
        </motion.div>

        {/* Revenue + acquisition */}
        <motion.div variants={container} className="grid gap-4 lg:grid-cols-3">
          <motion.div variants={rise} className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Recurring revenue"
                subtitle={`MRR over time · last ${serverRange} days`}
                info="MRR (Monthly Recurring Revenue) is the predictable subscription revenue billed each month."
                action={
                  <DeltaBadge
                    value={mrr.delta}
                    up={mrr.direction === "up"}
                    good={mrr.direction === "up"}
                    title={`vs previous ${serverRange} days`}
                  />
                }
              />
              <div className="px-3 pb-4 pt-6">
                <AreaTrend
                  data={series}
                  dataKey="mrr"
                  name="MRR"
                  color="#5B8DEF"
                  formatter={(v) => formatCurrency(v)}
                  compact={(v) => formatCurrency(v, true)}
                  animationBegin={500}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={rise}>
            <Card className="h-full">
              <CardHeader
                title="Acquisition"
                subtitle={`New signups by source · last ${serverRange} days`}
                info="The share of new signups attributed to each marketing channel in the selected period."
                action={
                  <DeltaBadge
                    value={Math.abs(acquisition.delta)}
                    up={acquisition.delta >= 0}
                    good={acquisition.delta >= 0}
                    title={`Signups vs previous ${serverRange} days`}
                  />
                }
              />
              <div className="p-5">
                <ChannelDonut channels={acquisition.channels} signups={acquisition.signups} />
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Active users */}
        <motion.div variants={rise}>
          <Card>
            <CardHeader
              title="User growth"
              subtitle={`Daily active accounts · last ${serverRange} days`}
              info="Unique accounts with at least one session per day — a measure of engagement, not signups."
            />
            <div className="px-3 pb-4 pt-6">
              <AreaTrend
                data={series}
                dataKey="users"
                name="Active users"
                color="#3FD68C"
                formatter={(v) => formatNumber(v)}
                compact={(v) => formatNumber(v, true)}
                height={220}
                animationBegin={700}
              />
            </div>
          </Card>
        </motion.div>

        {/* Activity + goal (not tied to the period) */}
        <motion.div variants={container} className="grid gap-4 lg:grid-cols-3">
          <motion.div variants={rise} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader title="Recent activity" subtitle="Latest account events · last 14 days" />
              <div className="mt-2">
                <ActivityFeed items={activity} />
              </div>
            </Card>
          </motion.div>
          <motion.div variants={rise}>
            <Card className="flex h-full flex-col">
              <CardHeader
                title="MRR goal"
                subtitle="Progress this quarter"
                info="Current MRR measured against the quarterly target set by the growth team."
              />
              <div className="flex flex-1 items-center justify-center p-5">
                <GoalRing goal={goal} />
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
