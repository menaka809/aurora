import OverviewView from "@/components/views/OverviewView";
import {
  getAcquisition,
  getActivity,
  getGoal,
  getKpis,
  getSeries,
} from "@/lib/data";

export default async function Overview() {
  const [kpis, series, acquisition, activity, goal] = await Promise.all([
    getKpis(),
    getSeries(30),
    getAcquisition(),
    getActivity(),
    getGoal(),
  ]);

  return (
    <OverviewView
      kpis={kpis}
      series={series}
      channels={acquisition.channels}
      signups={acquisition.signups}
      activity={activity}
      goal={goal}
    />
  );
}
