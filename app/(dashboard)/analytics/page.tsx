import type { Metadata } from "next";
import { cookies } from "next/headers";
import AnalyticsView from "@/components/views/AnalyticsView";
import { getFunnel, getKpis, getPlanBreakdown, getSeries } from "@/lib/data";
import { RANGE_COOKIE, resolveRange } from "@/lib/range";

export const metadata: Metadata = { title: "Analytics — Aurora" };

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, jar] = await Promise.all([searchParams, cookies()]);
  const range = resolveRange(params.range, jar.get(RANGE_COOKIE)?.value);

  const [series, kpis, funnel, plans] = await Promise.all([
    getSeries(range),
    getKpis(range),
    getFunnel(range),
    getPlanBreakdown(),
  ]);

  return <AnalyticsView range={range} series={series} kpis={kpis} funnel={funnel} plans={plans} />;
}
