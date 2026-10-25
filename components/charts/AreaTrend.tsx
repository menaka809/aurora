"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

/** Keys of T whose values are numbers (what an area can plot). */
type NumericKey<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T] & string;

export default function AreaTrend<T extends { label: string }>({
  data,
  dataKey,
  name,
  color,
  formatter,
  compact,
  height = 260,
  animationBegin = 300,
  animationDuration = 1500,
}: {
  /** Rows with an x-axis `label` plus the numeric series to plot. */
  data: T[];
  dataKey: NumericKey<T>;
  name: string;
  color: string;
  formatter: (v: number) => string;
  compact: (v: number) => string;
  height?: number;
  animationBegin?: number;
  animationDuration?: number;
}) {
  const gid = `area-${dataKey}`;
  const interval = Math.max(0, Math.floor(data.length / 6) - 1);
  // Font size is passed to Recharts too, so its label-overlap maths matches the CSS.
  const tick = { fontSize: 11 };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={interval}
            minTickGap={16}
            dy={12}
            height={36}
            tick={tick}
            // Keeps the first and last dates inside the card and clear of the y-axis labels.
            padding={{ left: 28, right: 16 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={58}
            tickMargin={8}
            tick={tick}
            // Fit the scale to the data so the trend is visible (not a flat line near the top).
            domain={["auto", "auto"]}
            tickCount={5}
            tickFormatter={(v) => compact(v as number)}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={<ChartTooltip formatter={formatter} />}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={color}
            strokeWidth={2.25}
            fill={`url(#${gid})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={animationDuration}
            animationBegin={animationBegin}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
