import type { Status } from "@/lib/customers";

const MAP: Record<Status, { cls: string; dot: string; label: string }> = {
  active: { cls: "bg-success/10 text-success", dot: "bg-success", label: "Active" },
  trial: { cls: "bg-primary/10 text-primary", dot: "bg-primary", label: "Trial" },
  past_due: { cls: "bg-warning/10 text-warning", dot: "bg-warning", label: "Past due" },
  churned: {
    cls: "bg-muted-foreground/10 text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Churned",
  },
};

/** Account status pill. Static markup: no client JS, and no motion in long tables. */
export default function StatusBadge({ status }: { status: Status }) {
  const m = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${m.cls}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
