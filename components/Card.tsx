import type { ReactNode } from "react";
import InfoTip from "./InfoTip";

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
          {/* h2: the page title in the top bar is the h1. */}
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">
            {title}
          </h2>
          {info && <InfoTip label={title} text={info} />}
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
