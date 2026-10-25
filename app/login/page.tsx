import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Sign in — Aurora" };

// Demo sign-in. Real authentication (Supabase) replaces this in Phase 4.
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="card-shadow w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-fg">Aurora</span>
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight text-fg">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue and growth analytics for SaaS teams.
        </p>

        <Link
          href="/"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Continue as demo user
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo workspace with sample data — no account needed.
        </p>
      </div>
    </main>
  );
}
