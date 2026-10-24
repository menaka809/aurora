import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { Card } from "@/components/Card";

export default function CustomerNotFound() {
  return (
    <div className="mx-auto max-w-lg pt-10">
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-elevated text-muted">
          <UserX className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-fg">
          Customer not found
        </h2>
        <p className="text-sm text-muted">
          This account doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/customers"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:bg-elevated"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
      </Card>
    </div>
  );
}
