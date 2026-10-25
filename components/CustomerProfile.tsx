"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Building2,
  CalendarDays,
  UserRound,
  CreditCard,
  ArrowUpCircle,
  LogIn,
  LifeBuoy,
  UserPlus,
  UserMinus,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader } from "./Card";
import StatusBadge from "./StatusBadge";
import ManagePlanDialog from "./ManagePlanDialog";
import MessageSheet from "./MessageSheet";
import NotesCard from "./NotesCard";
import {
  avatarColor,
  initials,
  type CustomerProfile as CP,
  type TimelineKind,
} from "@/lib/customers";
import { formatCurrency, formatDate, formatDaysAgo } from "@/lib/format";
import { useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { toast } from "@/lib/toast";

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const TL_ICON: Record<TimelineKind, { icon: LucideIcon; cls: string }> = {
  signup: { icon: UserPlus, cls: "bg-primary/12 text-primary" },
  payment: { icon: CreditCard, cls: "bg-warning/12 text-warning" },
  upgrade: { icon: ArrowUpCircle, cls: "bg-success/12 text-success" },
  login: { icon: LogIn, cls: "bg-muted-foreground/15 text-muted-foreground" },
  ticket: { icon: LifeBuoy, cls: "bg-warning/12 text-warning" },
  churn: { icon: UserMinus, cls: "bg-danger/12 text-danger" },
};

export default function CustomerProfile({ c, today }: { c: CP; today: string }) {
  const [planOpen, setPlanOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const hydrated = useHydrated();
  const storedChange = useUI((s) => s.planChanges[c.id]);
  const cancelPlanChange = useUI((s) => s.cancelPlanChange);
  // Saved in localStorage, so only read it after hydration.
  const planChange = hydrated ? storedChange : undefined;

  const stats = [
    { label: "Monthly revenue", value: c.mrr ? formatCurrency(c.mrr) : "—" },
    { label: "Lifetime value", value: formatCurrency(c.ltv) },
    { label: "Seats", value: String(c.seats) },
    { label: "Tenure", value: `${c.tenureMonths} mo` },
    { label: "Last seen", value: formatDaysAgo(c.lastLoginDays) },
  ];

  const undoPlanChange = () => {
    cancelPlanChange(c.id);
    toast("Plan change cancelled", {
      description: `${c.name} stays on ${c.plan}.`,
      type: "info",
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-[1400px] space-y-4"
    >
      <motion.div variants={rise}>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={rise}>
        <Card className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
                style={{ background: avatarColor(c.name) }}
              >
                {initials(c.name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-fg">
                    {c.name}
                  </h2>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMessageOpen(true)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:bg-elevated"
              >
                Message
              </button>
              <button
                onClick={() => setPlanOpen(true)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {c.status === "churned" ? "Reactivate" : "Manage plan"}
              </button>
            </div>
          </div>

          {planChange && (
            <div className="mt-5 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-fg">
                <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Moving from <strong className="font-medium">{c.plan}</strong> to{" "}
                  <strong className="font-medium">{planChange.plan}</strong>
                  {planChange.effective === today
                    ? " — effective today."
                    : ` on ${formatDate(planChange.effective)}.`}
                </span>
              </p>
              <button
                onClick={undoPlanChange}
                className="self-start rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 sm:self-auto"
              >
                Undo
              </button>
            </div>
          )}

          {/* Stat strip */}
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="tabular mt-1 text-lg font-semibold text-fg">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Activity timeline */}
          <motion.div variants={rise}>
            <Card>
              <CardHeader
                title="Activity timeline"
                subtitle="Everything this account has done"
              />
              <ol className="relative px-5 py-5">
                <span className="absolute bottom-8 left-[34px] top-9 w-px bg-border" />
                {c.timeline.map((e) => {
                  const { icon: Icon, cls } = TL_ICON[e.kind];
                  return (
                    <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
                      <span
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${cls}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1 pt-1">
                        <p className="text-sm text-fg">
                          {e.title}
                          {e.meta && (
                            <span className="tabular ml-2 text-muted-foreground">
                              {e.meta}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(e.date)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </motion.div>

          {/* Payments */}
          <motion.div variants={rise}>
            <Card className="overflow-hidden">
              <CardHeader title="Payments" subtitle="Recent invoices" />
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-y border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5 text-left font-medium">Invoice</th>
                    <th className="px-5 py-2.5 text-left font-medium">Date</th>
                    <th className="px-5 py-2.5 text-left font-medium">Amount</th>
                    <th className="px-5 py-2.5 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {c.payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="tabular px-5 py-3 text-muted-foreground">
                        {p.invoice}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(p.date)}
                      </td>
                      <td className="tabular px-5 py-3 font-medium text-fg">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <PayStatus status={p.status} />
                      </td>
                    </tr>
                  ))}
                  {c.payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                        No payments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </motion.div>

          {/* Support tickets */}
          <motion.div variants={rise}>
            <Card>
              <CardHeader title="Support tickets" subtitle="Open and resolved" />
              <div className="p-5 pt-3">
                {c.tickets.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <LifeBuoy className="h-6 w-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No tickets — a happy customer.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {c.tickets.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-fg">{t.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.priority} priority · {formatDate(t.date)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            t.status === "open"
                              ? "bg-warning/10 text-warning"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {t.status === "open" ? "Open" : "Resolved"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <motion.div variants={rise}>
            <Card>
              <CardHeader title="Details" />
              <dl className="space-y-4 p-5 pt-4 text-sm">
                <Detail icon={Mail} label="Email" value={c.email} />
                <Detail icon={Building2} label="Company" value={c.company} />
                <Detail icon={CreditCard} label="Plan" value={`${c.plan} · ${c.seats} seats`} />
                <Detail icon={CalendarDays} label="Customer since" value={formatDate(c.joined)} />
                <Detail icon={UserRound} label="Account manager" value={c.manager} />
              </dl>
            </Card>
          </motion.div>

          <motion.div variants={rise}>
            <Card>
              <CardHeader title="Tags" />
              <div className="flex flex-wrap gap-2 p-5 pt-4">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border bg-elevated px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={rise}>
            <NotesCard customerId={c.id} seeded={c.notes} />
          </motion.div>
        </div>
      </div>

      {/* Mounted only while open so the selection starts fresh each time. */}
      {planOpen && (
        <ManagePlanDialog open onOpenChange={setPlanOpen} customer={c} today={today} />
      )}
      <MessageSheet open={messageOpen} onOpenChange={setMessageOpen} recipients={[c]} />
    </motion.div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-fg">{value}</dd>
      </div>
    </div>
  );
}

function PayStatus({ status }: { status: "paid" | "refunded" | "failed" }) {
  const map = {
    paid: "bg-success/10 text-success",
    refunded: "bg-muted-foreground/15 text-muted-foreground",
    failed: "bg-danger/10 text-danger",
  } as const;
  const label = { paid: "Paid", refunded: "Refunded", failed: "Failed" }[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}>
      {label}
    </span>
  );
}
