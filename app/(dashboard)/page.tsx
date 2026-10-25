import type { Metadata } from "next";
import { cookies } from "next/headers";
import OverviewView from "@/components/views/OverviewView";
import { getAcquisition, getActivity, getGoal, getKpis, getSeries } from "@/lib/data";
import { RANGE_COOKIE, resolveRange } from "@/lib/range";

export const metadata: Metadata = { title: "Overview" };

export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, jar] = await Promise.all([searchParams, cookies()]);
  const range = resolveRange(params.range, jar.get(RANGE_COOKIE)?.value);

  const [kpis, series, acquisition, activity, goal] = await Promise.all([
    getKpis(range),
    getSeries(range),
    getAcquisition(range),
    getActivity(),
    getGoal(),
  ]);

  return (
    <OverviewView
      range={range}
      kpis={kpis}
      series={series}
      acquisition={acquisition}
      activity={activity}
      goal={goal}
    />
  );
}
