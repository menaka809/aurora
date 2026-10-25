"use client";

import { useEffect } from "react";
import { Printer, X } from "lucide-react";

/** On-screen bar for the print report; opens the print dialog once on load. */
export default function PrintActions() {
  useEffect(() => {
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
        <p className="text-sm text-muted-foreground">Print preview · fits A4 and Letter</p>
        <div className="flex gap-2">
          <button
            onClick={() => window.close()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-fg transition-colors hover:bg-fg/5"
          >
            <X className="size-4" />
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Printer className="size-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
