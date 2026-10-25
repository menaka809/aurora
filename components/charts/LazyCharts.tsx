"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type AreaTrendComponent from "./AreaTrend";
import type ChannelDonutComponent from "./ChannelDonut";

// Recharts only draws in the browser (it measures its container), so these
// wrappers:
// 1. load it on demand — one shared chunk, out of the main bundle;
// 2. mount a chart only when it nears the viewport (charts below the fold
//    cost nothing until you scroll to them);
// 3. render it inside a transition, so React time-slices the work instead of
//    blocking the main thread;
// 4. reserve the chart's exact size, so nothing shifts when it appears.

const AreaTrendImpl = dynamic(() => import("./chart-bundle").then((m) => m.AreaTrend), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
}) as typeof AreaTrendComponent;

const ChannelDonutImpl = dynamic(() => import("./chart-bundle").then((m) => m.ChannelDonut), {
  ssr: false,
  loading: () => <DonutSkeleton />,
}) as typeof ChannelDonutComponent;

function DonutSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <Skeleton className="size-[180px] shrink-0 rounded-full" />
      <div className="w-full space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Renders `children` once the placeholder is within ~200px of the viewport. */
function WhenVisible({ placeholder, children }: { placeholder: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        startTransition(() => setVisible(true));
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="size-full">
      {visible ? children : placeholder}
    </div>
  );
}

export function AreaTrend<T extends { label: string }>(
  props: ComponentProps<typeof AreaTrendComponent<T>>
) {
  return (
    <div style={{ height: props.height ?? 260 }} className="w-full">
      <WhenVisible placeholder={<Skeleton className="size-full" />}>
        <AreaTrendImpl {...props} />
      </WhenVisible>
    </div>
  );
}

export function ChannelDonut(props: ComponentProps<typeof ChannelDonutComponent>) {
  return (
    <WhenVisible placeholder={<DonutSkeleton />}>
      <ChannelDonutImpl {...props} />
    </WhenVisible>
  );
}
