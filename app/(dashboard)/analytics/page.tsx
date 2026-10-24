import AnalyticsView from "@/components/views/AnalyticsView";
import { getFunnel, getPlanBreakdown, getSeries } from "@/lib/data";

export default async function Analytics() {
  const [series, funnel, plans] = await Promise.all([
    getSeries(90),
    getFunnel(),
    getPlanBreakdown(),
  ]);

  return <AnalyticsView series={series} funnel={funnel} plans={plans} />;
}
