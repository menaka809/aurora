import type { ReactNode } from "react";
import { Info } from "lucide-react";

/** Flat surface card — used everywhere except the glass KPI cards. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card-shadow theme-tint rounded-xl border border-border bg-surface ${className}`}
    >
      {children}
    </div>
  );
}

/** Hover-for-definition info tooltip (pure CSS, no JS). */
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="group/info relative inline-flex align-middle">
      <Info className="h-3.5 w-3.5 cursor-help text-muted/70 transition-colors hover:text-fg" />
      <span className="pointer-events-none absolute left-1/2 top-6 z-30 w-56 -translate-x-1/2 rounded-lg border border-border bg-elevated px-3 py-2 text-xs leading-relaxed text-muted opacity-0 shadow-xl transition-opacity duration-200 group-hover/info:opacity-100">
        {text}
      </span>
    </span>
  );
}

export function CardHeader({
  title,
  subtitle,
  info,
  action,
}: {
  title: string;
  subtitle?: string;
  info?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[15px] font-semibold tracking-tight text-fg">
            {title}
          </h3>
          {info && <InfoTip text={info} />}
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
