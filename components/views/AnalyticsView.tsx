import { formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardHeader } from "@/components/Card";
import { AreaTrend } from "@/components/charts/LazyCharts";
import ConversionFunnel from "@/components/ConversionFunnel";
import PlanBreakdown from "@/components/PlanBreakdown";
import RangeShell from "@/components/RangeShell";
import DeltaBadge from "@/components/DeltaBadge";
import type { Range } from "@/lib/range";
import type { DayPoint, FunnelStage, Kpi, PlanSlice } from "@/lib/data/types";

/** Staggered CSS entrance delay for a section (see `.rise` in globals.css). */
const delay = (i: number) => ({ animationDelay: `${i * 80}ms` });

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

/** Analytics page. A server component; charts and the range switch are client islands. */
export default function AnalyticsView({
  range,
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
  const mrr = kpis.find((k) => k.key === "mrr")!;
  const users = kpis.find((k) => k.key === "users")!;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <RangeShell range={range}>
        {/* Q: Is recurring revenue growing? */}
        <div className="rise" style={delay(1)}>
          <Card>
            <CardHeader
              title="Recurring revenue"
              subtitle={`MRR over time · last ${range} days`}
              info="MRR (Monthly Recurring Revenue) is the predictable subscription revenue billed each month, excluding one-off charges."
              action={<HeadlineStat value={formatCurrency(mrr.value)} kpi={mrr} range={range} />}
            />
            <div className="px-3 pb-4 pt-6">
              <AreaTrend
                data={series}
                dataKey="mrr"
                name="MRR"
                color="var(--chart-1)"
                format="currency"
                height={300}
                animationBegin={0}
                animationDuration={800}
              />
            </div>
          </Card>
        </div>

        {/* Q: Is the active audience growing? */}
        <div className="rise" style={delay(2)}>
          <Card>
            <CardHeader
              title="User growth"
              subtitle={`Daily active accounts · last ${range} days`}
              info="Active users are unique accounts with at least one session on a given day."
              action={<HeadlineStat value={formatNumber(users.value)} kpi={users} range={range} />}
            />
            <div className="px-3 pb-4 pt-6">
              <AreaTrend
                data={series}
                dataKey="users"
                name="Active users"
                color="var(--chart-2)"
                format="number"
                height={260}
                animationBegin={0}
                animationDuration={800}
              />
            </div>
          </Card>
        </div>

        {/* Q: Where do we lose people / which plans pay? */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rise" style={delay(3)}>
            <Card className="h-full">
              <CardHeader
                title="Conversion funnel"
                subtitle={`Where visitors drop off before paying · last ${range} days`}
                info="Each stage's percentage is its conversion from the stage directly above it."
              />
              <ConversionFunnel stages={funnel} />
            </Card>
          </div>
          <div className="rise" style={delay(4)}>
            <Card className="h-full">
              <CardHeader
                title="Revenue by plan"
                subtitle="Share of current MRR by subscription tier"
                info="How total Monthly Recurring Revenue splits across your plan tiers today."
              />
              <PlanBreakdown data={plans} />
            </Card>
          </div>
        </div>
      </RangeShell>
    </div>
  );
}
