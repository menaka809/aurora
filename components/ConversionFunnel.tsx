import { formatNumber } from "@/lib/format";
import type { FunnelStage } from "@/lib/data/types";

/** Funnel bars. Server-rendered; widths animate via CSS when the period changes. */
export default function ConversionFunnel({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0].value;

  return (
    <div className="space-y-5 p-5 pt-2">
      {stages.map((s, i) => {
        const width = (s.value / max) * 100;
        const conv = i > 0 ? (s.value / stages[i - 1].value) * 100 : 100;
        return (
          <div key={s.stage}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-fg">{s.stage}</span>
              <span className="flex items-baseline gap-3">
                <span className="tabular font-medium text-fg">{formatNumber(s.value)}</span>
                {i > 0 && (
                  <span
                    className="tabular w-12 text-right text-xs text-muted-foreground"
                    title={`${conv.toFixed(1)}% of ${stages[i - 1].stage.toLowerCase()}`}
                  >
                    {conv.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-fg/8">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${width}%`,
                  transitionDelay: `${i * 60}ms`,
                  background: "linear-gradient(90deg, var(--chart-1), var(--chart-2))",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
