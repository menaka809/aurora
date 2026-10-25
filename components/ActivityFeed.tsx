import Link from "next/link";
import { UserPlus, ArrowUpCircle, CreditCard, UserMinus, AlertTriangle } from "lucide-react";
import { formatDaysAgo } from "@/lib/format";
import type { ActivityItem, ActivityKind } from "@/lib/data/types";

const ICON: Record<ActivityKind, { icon: typeof UserPlus; cls: string }> = {
  new: { icon: UserPlus, cls: "bg-primary/12 text-primary" },
  upgrade: { icon: ArrowUpCircle, cls: "bg-success/12 text-success" },
  payment: { icon: CreditCard, cls: "bg-warning/12 text-warning" },
  failed: { icon: AlertTriangle, cls: "bg-danger/12 text-danger" },
  churn: { icon: UserMinus, cls: "bg-danger/12 text-danger" },
};

/** Latest account events. Server-rendered; rows slide in with a CSS stagger. */
export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-muted-foreground">
        No account activity in the last two weeks.
      </p>
    );
  }

  return (
    <ul className="px-2 pb-2">
      {items.map((a, i) => {
        const { icon: Icon, cls } = ICON[a.kind];
        return (
          <li key={a.id} className="rise" style={{ animationDelay: `${200 + i * 50}ms` }}>
            <Link
              href={`/customers/${a.customerId}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-fg/5"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                <span className="font-medium text-fg">{a.who}</span> {a.action}
                {a.meta && <span className="font-medium text-fg"> {a.meta}</span>}
              </p>
              <span className="tabular shrink-0 text-xs text-muted-foreground">
                {formatDaysAgo(a.daysAgo)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
