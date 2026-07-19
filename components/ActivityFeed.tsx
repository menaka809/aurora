"use client";

import { motion, type Variants } from "framer-motion";
import { UserPlus, ArrowUpCircle, CreditCard, UserMinus } from "lucide-react";
import { ACTIVITY, type ActivityKind } from "@/lib/insights";

const ICON: Record<
  ActivityKind,
  { icon: typeof UserPlus; cls: string }
> = {
  new: { icon: UserPlus, cls: "bg-primary/12 text-primary" },
  upgrade: { icon: ArrowUpCircle, cls: "bg-success/12 text-success" },
  payment: { icon: CreditCard, cls: "bg-warning/12 text-warning" },
  churn: { icon: UserMinus, cls: "bg-danger/12 text-danger" },
};

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};
const row: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function ActivityFeed() {
  return (
    <motion.ul variants={list} initial="hidden" animate="show" className="px-2 pb-2">
      {ACTIVITY.map((a) => {
        const { icon: Icon, cls } = ICON[a.kind];
        return (
          <motion.li
            key={a.id}
            variants={row}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-elevated"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-muted">
              <span className="font-medium text-fg">{a.who}</span> {a.action}
              {a.meta && <span className="font-medium text-fg"> {a.meta}</span>}
            </p>
            <span className="tabular shrink-0 text-xs text-muted">{a.time}</span>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
