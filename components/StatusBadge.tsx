"use client";

import { motion } from "framer-motion";
import type { Status } from "@/lib/customers";

const MAP: Record<
  Status,
  { cls: string; dot: string; label: string; pulse?: boolean }
> = {
  active: { cls: "bg-success/10 text-success", dot: "bg-success", label: "Active", pulse: true },
  trial: { cls: "bg-primary/10 text-primary", dot: "bg-primary", label: "Trial" },
  past_due: { cls: "bg-warning/10 text-warning", dot: "bg-warning", label: "Past due" },
  churned: { cls: "bg-muted-foreground/10 text-muted-foreground", dot: "bg-muted-foreground", label: "Churned" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const m = MAP[status];
  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${m.cls}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {m.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dot} opacity-60`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${m.dot}`} />
      </span>
      {m.label}
    </motion.span>
  );
}
