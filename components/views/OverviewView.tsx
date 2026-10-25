import KpiCard from "@/components/KpiCard";
import { Card, CardHeader } from "@/components/Card";
import { AreaTrend, ChannelDonut } from "@/components/charts/LazyCharts";
import ActivityFeed from "@/components/ActivityFeed";
import GoalRing from "@/components/GoalRing";
import RangeShell from "@/components/RangeShell";
import DeltaBadge from "@/components/DeltaBadge";
import type { Range } from "@/lib/range";
import type { Acquisition, ActivityItem, DayPoint, Goal, Kpi } from "@/lib/data/types";

/** Staggered CSS entrance delay for a section (see `.rise` in globals.css). */
const delay = (i: number) => ({ animationDelay: `${i * 80}ms` });

/**
 * Overview dashboard. A server component: the cards are plain HTML, and only
 * the range switch, animated numbers, info hints and charts hydrate as small
 * client islands.
 */
export default function OverviewView({
  range,
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
  const mrr = kpis.find((k) => k.key === "mrr")!;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 md:space-y-5">
      <RangeShell range={range}>
        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.key} kpi={kpi} index={i} range={range} />
          ))}
        </div>

        {/* Revenue + acquisition */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rise lg:col-span-2" style={delay(2)}>
            <Card>
              <CardHeader
                title="Recurring revenue"
                subtitle={`MRR over time · last ${range} days`}
                info="MRR (Monthly Recurring Revenue) is the predictable subscription revenue billed each month."
                action={
                  <DeltaBadge
                    value={mrr.delta}
                    up={mrr.direction === "up"}
                    good={mrr.direction === "up"}
                    title={`vs previous ${range} days`}
                  />
                }
              />
              <div className="px-3 pb-4 pt-6">
                <AreaTrend
                  data={series}
                  dataKey="mrr"
                  name="MRR"
                  color="var(--chart-1)"
                  format="currency"
                  animationBegin={300}
                />
              </div>
            </Card>
          </div>

          <div className="rise" style={delay(3)}>
            <Card className="h-full">
              <CardHeader
                title="Acquisition"
                subtitle={`New signups by source · last ${range} days`}
                info="The share of new signups attributed to each marketing channel in the selected period."
                action={
                  <DeltaBadge
                    value={Math.abs(acquisition.delta)}
                    up={acquisition.delta >= 0}
                    good={acquisition.delta >= 0}
                    title={`Signups vs previous ${range} days`}
                  />
                }
              />
              <div className="p-5">
                <ChannelDonut channels={acquisition.channels} signups={acquisition.signups} />
              </div>
            </Card>
          </div>
        </div>

        {/* Active users */}
        <div className="rise" style={delay(4)}>
          <Card>
            <CardHeader
              title="User growth"
              subtitle={`Daily active accounts · last ${range} days`}
              info="Unique accounts with at least one session per day — a measure of engagement, not signups."
            />
            <div className="px-3 pb-4 pt-6">
              <AreaTrend
                data={series}
                dataKey="users"
                name="Active users"
                color="var(--chart-2)"
                format="number"
                height={220}
                animationBegin={400}
              />
            </div>
          </Card>
        </div>

        {/* Activity + goal (not tied to the period) */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rise lg:col-span-2" style={delay(5)}>
            <Card className="h-full">
              <CardHeader title="Recent activity" subtitle="Latest account events · last 14 days" />
              <div className="mt-2">
                <ActivityFeed items={activity} />
              </div>
            </Card>
          </div>
          <div className="rise" style={delay(6)}>
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
          </div>
        </div>
      </RangeShell>
    </div>
  );
}
