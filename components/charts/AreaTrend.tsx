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

export default function AreaTrend({
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
  data: Record<string, unknown>[];
  dataKey: string;
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

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
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
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={58}
            tickMargin={8}
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
