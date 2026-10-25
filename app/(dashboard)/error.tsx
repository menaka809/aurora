"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Card } from "@/components/Card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg pt-10">
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-fg">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          This view couldn&apos;t load. Try again — if it keeps happening, refresh the page.
        </p>
        <button
          onClick={reset}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </Card>
    </div>
  );
}
