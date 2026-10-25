import { Skeleton } from "@/components/ui/skeleton";

// Loading placeholders that mirror each page's real layout, so content slots
// in without the page jumping. Used by the routes' loading.tsx files.

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={`card-shadow rounded-xl border border-border bg-surface ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-start justify-between px-5 pt-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-52" />
      </div>
      {action && <Skeleton className="h-6 w-16" />}
    </div>
  );
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <CardShell>
      <CardHeaderSkeleton action />
      <div className="px-5 pb-5 pt-6">
        <Skeleton className="w-full" style={{ height }} />
      </div>
    </CardShell>
  );
}

function RangeBarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-72 max-w-[60%]" />
      <Skeleton className="h-9 w-40" />
    </div>
  );
}

/** Screen-reader announcement shared by every skeleton. */
function Loading({ label }: { label: string }) {
  return (
    <p role="status" className="sr-only">
      Loading {label}…
    </p>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 md:space-y-5">
      <Loading label="overview" />
      <RangeBarSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <CardShell key={i} className="space-y-3 p-5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
          </CardShell>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton height={260} />
        </div>
        <CardShell>
          <CardHeaderSkeleton />
          <div className="flex items-center gap-6 p-5">
            <Skeleton className="size-[180px] shrink-0 rounded-full" />
            <div className="w-full space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </div>
        </CardShell>
      </div>
      <ChartSkeleton height={220} />
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Loading label="analytics" />
      <RangeBarSkeleton />
      <ChartSkeleton height={300} />
      <ChartSkeleton height={260} />
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <CardShell key={i}>
            <CardHeaderSkeleton />
            <div className="space-y-5 p-5">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </CardShell>
        ))}
      </div>
    </div>
  );
}

export function CustomersSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Loading label="customers" />
      <Skeleton className="h-10 w-[34rem] max-w-full rounded-xl" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-72 max-w-[60vw]" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="hidden gap-2 md:flex">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <CardShell className="overflow-hidden">
        <div className="flex items-center gap-6 border-b border-border px-4 py-3.5">
          {[16, 160, 70, 70, 80, 70, 50, 80].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-border px-4 py-3 last:border-0">
            <Skeleton className="size-4 shrink-0" />
            <div className="flex w-40 items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="w-full space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
            <Skeleton className="hidden h-3 w-16 md:block" />
            <Skeleton className="hidden h-3 w-10 md:block" />
            <Skeleton className="hidden h-3 w-20 lg:block" />
          </div>
        ))}
      </CardShell>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Loading label="customer profile" />
      <Skeleton className="h-4 w-36" />
      <CardShell className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </CardShell>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ChartSkeleton height={220} />
          <ChartSkeleton height={160} />
        </div>
        <div className="space-y-4">
          <ChartSkeleton height={140} />
          <ChartSkeleton height={100} />
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <Loading label="settings" />
      <CardShell className="space-y-5 p-5">
        <CardHeaderSkeleton />
        <div className="grid gap-5 px-0 sm:grid-cols-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
}
