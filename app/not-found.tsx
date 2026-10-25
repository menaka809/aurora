import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Sparkles className="h-6 w-6" />
      </span>
      <p className="tabular text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        This page doesn&apos;t exist
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The link may be broken, or the page may have moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-primary-solid px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Go to the dashboard
      </Link>
    </main>
  );
}
