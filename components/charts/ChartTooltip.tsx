"use client";

type Entry = { name?: string; value?: number | string; color?: string };

/** Themed Recharts tooltip. */
export default function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Entry[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="min-w-[140px] rounded-lg border border-border bg-elevated/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
      {label && (
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
      )}
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: e.color }}
          />
          <span className="text-xs text-muted">{e.name}</span>
          <span className="tabular ml-auto text-sm font-semibold text-fg">
            {typeof e.value === "number" && formatter
              ? formatter(e.value)
              : e.value}
          </span>
        </div>
      ))}
    </div>
  );
}
