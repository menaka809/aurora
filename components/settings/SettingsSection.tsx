import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/Card";

/** One settings section: titled card with optional footer for its actions. */
export default function SettingsSection({
  id,
  title,
  description,
  children,
  footer,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 id={`${id}-title`} className="text-[15px] font-semibold tracking-tight text-fg">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-fg/[0.02] px-5 py-3 sm:px-6">
            {footer}
          </div>
        )}
      </Card>
    </section>
  );
}

/**
 * A settings tab: the form, and on wide screens (1536px+, where both fit
 * comfortably) a live preview beside it that stays in view.
 */
export function SettingsPanel({ children, preview }: { children: ReactNode; preview: ReactNode }) {
  return (
    <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_380px] [&>*]:min-w-0">
      {/* Without the preview, a reading width keeps switches close to their labels. */}
      <div className="min-w-0 max-w-3xl 2xl:max-w-none">{children}</div>
      <aside aria-label="Preview" className="hidden 2xl:sticky 2xl:top-22 2xl:block">
        {preview}
      </aside>
    </div>
  );
}

/**
 * A preview window: a "Live preview" title bar, the sample on a soft dotted
 * stage, and a short tip underneath.
 */
export function PreviewCard({
  title,
  tip,
  children,
}: {
  title: string;
  /** One friendly sentence about what the preview shows. */
  tip?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="card-shadow overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-medium text-fg">
          <span className="size-2 rounded-full bg-success shadow-[0_0_0_3px] shadow-success/20" />
          Live preview
        </span>
        <span className="truncate text-xs text-muted-foreground">{title}</span>
      </div>
      <div className="preview-stage p-5">{children}</div>
      {tip && (
        <div className="flex gap-2.5 border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <Lightbulb className="mt-px size-3.5 shrink-0 text-primary" />
          <p>{tip}</p>
        </div>
      )}
    </div>
  );
}
