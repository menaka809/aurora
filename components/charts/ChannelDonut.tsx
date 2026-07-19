"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { CHANNELS } from "@/lib/metrics";

export default function ChannelDonut() {
  const total = CHANNELS.reduce((s, c) => s + c.value, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
            <Pie
              data={CHANNELS}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
              animationDuration={1200}
              animationBegin={400}
              animationEasing="ease-out"
            >
              {CHANNELS.map((c) => (
                <Cell key={c.name} fill={c.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-2xl font-semibold text-fg">{total}%</span>
          <span className="text-[11px] text-muted">tracked</span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-3">
        {CHANNELS.map((c) => (
          <li key={c.name} className="flex items-center gap-3 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: c.color }}
            />
            <span className="text-muted">{c.name}</span>
            <span className="tabular ml-auto font-medium text-fg">{c.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
