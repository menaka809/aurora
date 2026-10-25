import type { ReactNode } from "react";
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
    // scroll-mt clears the sticky top bar (and the mobile section tabs).
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 lg:scroll-mt-24">
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
