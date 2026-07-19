"use client";

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
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader } from "./Card";
import StatusBadge from "./StatusBadge";
import {
  avatarColor,
  initials,
  type CustomerProfile as CP,
  type TimelineKind,
} from "@/lib/customers";
import { formatCurrency, formatDate } from "@/lib/format";

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
  login: { icon: LogIn, cls: "bg-muted/15 text-muted" },
  ticket: { icon: LifeBuoy, cls: "bg-danger/12 text-danger" },
};

export default function CustomerProfile({ c }: { c: CP }) {
  const stats = [
    { label: "Monthly revenue", value: c.mrr ? formatCurrency(c.mrr) : "—" },
    { label: "Lifetime value", value: formatCurrency(c.ltv) },
    { label: "Seats", value: String(c.seats) },
    { label: "Tenure", value: `${c.tenureMonths} mo` },
    {
      label: "Last seen",
      value: c.lastLoginDays === 0 ? "Today" : `${c.lastLoginDays}d ago`,
    },
  ];

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
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
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
                <p className="mt-0.5 text-sm text-muted">{c.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:bg-elevated">
                Message
              </button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                Manage plan
              </button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface p-4">
                <p className="text-xs text-muted">{s.label}</p>
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
                            <span className="tabular ml-2 text-muted">
                              {e.meta}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
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
                  <tr className="border-y border-border text-xs uppercase tracking-wide text-muted">
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
                      <td className="tabular px-5 py-3 text-muted">
                        {p.invoice}
                      </td>
                      <td className="px-5 py-3 text-muted">
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
                      <td colSpan={4} className="px-5 py-8 text-center text-muted">
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
                    <LifeBuoy className="h-6 w-6 text-muted/50" />
                    <p className="text-sm text-muted">
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
                          <p className="text-xs text-muted">
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
                <Detail icon={Building2} label="Company" value={company(c.email)} />
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
                    className="rounded-md border border-border bg-elevated px-2.5 py-1 text-xs text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={rise}>
            <Card>
              <CardHeader title="Notes" subtitle="Internal · not visible to customer" />
              <div className="space-y-3 p-5 pt-4">
                {c.notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-border bg-elevated p-3"
                  >
                    <p className="text-sm text-fg">{n.text}</p>
                    <p className="mt-2 text-xs text-muted">
                      {n.author} · {formatDate(n.date)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
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
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="truncate text-fg">{value}</dd>
      </div>
    </div>
  );
}

function PayStatus({ status }: { status: "paid" | "refunded" | "failed" }) {
  const map = {
    paid: "bg-success/10 text-success",
    refunded: "bg-muted/15 text-muted",
    failed: "bg-danger/10 text-danger",
  } as const;
  const label = { paid: "Paid", refunded: "Refunded", failed: "Failed" }[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}>
      {label}
    </span>
  );
}

function company(email: string): string {
  const domain = email.split("@")[1] ?? "";
  const name = domain.split(".")[0] ?? "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
