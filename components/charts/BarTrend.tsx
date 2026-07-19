"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

export default function BarTrend({
  data,
  dataKey,
  name,
  color,
  formatter,
  compact,
  height = 240,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  name: string;
  color: string;
  formatter: (v: number) => string;
  compact: (v: number) => string;
  height?: number;
}) {
  const interval = Math.max(0, Math.floor(data.length / 6) - 1);
  const values = data.map((d) => d[dataKey] as number);
  const peak = Math.max(...values);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
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
            cursor={{ fill: "var(--elevated)", opacity: 0.5 }}
            content={<ChartTooltip formatter={formatter} />}
          />
          <Bar
            dataKey={dataKey}
            name={name}
            radius={[3, 3, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
            maxBarSize={26}
          >
            {values.map((v, i) => (
              <Cell key={i} fill={color} fillOpacity={0.35 + (v / peak) * 0.65} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
