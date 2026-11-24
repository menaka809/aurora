"use client";

import { useId } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Mail,
  Minus,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import SettingsSection, { PreviewCard, SettingsPanel } from "./SettingsSection";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_NOTIFICATIONS, DEFAULT_PROFILE, useUI, type NotificationPrefs } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { formatCurrency, formatValue } from "@/lib/format";
import type { Kpi, WeeklyDigest } from "@/lib/data/types";

const OPTIONS: { key: keyof NotificationPrefs; icon: LucideIcon; title: string; description: string }[] = [
  {
    key: "weeklyDigest",
    icon: Mail,
    title: "Weekly digest",
    description: "MRR, churn and top accounts every Monday morning.",
  },
  {
    key: "paymentAlerts",
    icon: CreditCard,
    title: "Failed payments",
    description: "As soon as a customer's payment fails or goes past due.",
  },
  {
    key: "signupAlerts",
    icon: UserPlus,
    title: "New sign-ups",
    description: "Each time a new customer starts a trial.",
  },
];

export default function NotificationsSection({ digest }: { digest: WeeklyDigest }) {
  const hydrated = useHydrated();
  const stored = useUI((s) => s.notifications);
  const profile = useUI((s) => s.profile);
  const setNotification = useUI((s) => s.setNotification);
  const prefs = hydrated ? stored : DEFAULT_NOTIFICATIONS;
  const { email, fullName } = hydrated ? profile : DEFAULT_PROFILE;

  return (
    <SettingsPanel
      preview={<DigestPreview digest={digest} prefs={prefs} email={email} fullName={fullName} />}
    >
      <SettingsSection
        id="notifications"
        title="Email notifications"
        description={`Sent to ${email}. Each switch saves on its own.`}
      >
        <ul className="-my-2 divide-y divide-border">
          {OPTIONS.map(({ key, ...o }) => (
            <NotificationRow
              key={key}
              {...o}
              checked={prefs[key]}
              onChange={(on) => setNotification(key, on)}
            />
          ))}
        </ul>
      </SettingsSection>
    </SettingsPanel>
  );
}

function NotificationRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (on: boolean) => void;
}) {
  const id = useId();
  return (
    <li className="flex items-center gap-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fg/5 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      {/* The whole text block is the label, so it toggles the switch too. */}
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-medium text-fg">{title}</span>
        <span id={`${id}-desc`} className="block text-xs text-muted-foreground">
          {description}
        </span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={`${id}-desc`} />
    </li>
  );
}

const SHORT_LABEL: Record<Kpi["key"], string> = {
  mrr: "MRR",
  users: "Active users",
  churn: "Churn rate",
  nrr: "Net retention",
};

/** "↑ 4.1%" coloured by whether the change is good news. */
function Change({ kpi }: { kpi: Kpi }) {
  const up = kpi.direction === "up";
  // Rounds to 0.0: no arrow, no good/bad colour.
  const flat = kpi.delta < 0.05;
  const Arrow = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`tabular inline-flex items-center gap-0.5 text-[11px] font-medium ${
        flat ? "text-muted-foreground" : up === kpi.positiveIsGood ? "text-success" : "text-danger"
      }`}
    >
      <Arrow className="size-3" />
      {kpi.delta.toFixed(1)}
      {kpi.deltaUnit === "%" ? "%" : " pts"}
    </span>
  );
}

/** The Monday email, built from this week's real numbers, plus the instant alerts. */
function DigestPreview({
  digest,
  prefs,
  email,
  fullName,
}: {
  digest: WeeklyDigest;
  prefs: NotificationPrefs;
  email: string;
  fullName: string;
}) {
  const mrr = digest.kpis.find((k) => k.key === "mrr")!;
  const firstName = fullName.split(" ")[0] || "there";

  return (
    <PreviewCard
      title="Monday's weekly digest"
      tip="A sample of Monday's email with this week's numbers. Turn an email off and it fades out here."
    >
      <div className="card-shadow relative overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-solid to-chart-4 text-white">
              <Sparkles className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-xs font-medium text-fg">Aurora</p>
              <p className="truncate text-[11px] text-muted-foreground">to {email}</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">Mon 8:00</span>
          </div>
          <p className="mt-2.5 text-sm font-semibold text-fg">
            Your week: MRR {formatCurrency(mrr.value, true)}, {mrr.direction === "up" ? "up" : "down"}{" "}
            {mrr.delta.toFixed(1)}%
          </p>
        </div>

        <div className="px-4 py-4">
          <p className="text-xs text-muted-foreground">Hi {firstName}, here&apos;s how the last 7 days went.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {digest.kpis.map((k) => (
              <div key={k.key} className="rounded-lg bg-fg/[0.04] px-2.5 py-2">
                <p className="text-[11px] text-muted-foreground">{SHORT_LABEL[k.key]}</p>
                <p className="tabular text-sm font-semibold text-fg">{formatValue(k.value, k.format)}</p>
                <Change kpi={k} />
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Top accounts
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {digest.topAccounts.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-fg">
                  {c.name} <span className="text-muted-foreground">· {c.company}</span>
                </span>
                <span className="tabular shrink-0 text-fg">{formatCurrency(c.mrr)}</span>
              </li>
            ))}
          </ul>
          <span className="mt-4 inline-flex rounded-md bg-primary-solid px-3 py-1.5 text-xs font-medium text-white">
            Open dashboard
          </span>
        </div>

        {!prefs.weeklyDigest && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface/80 px-6 text-center backdrop-blur-[2px]">
            <p className="text-sm font-medium text-fg">Weekly digest is off</p>
            <p className="text-xs text-muted-foreground">Turn it on to get this email every Monday.</p>
          </div>
        )}
      </div>

      <p className="mb-2 mt-5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Instant alerts
      </p>
      <div className="card-shadow divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {digest.failedPayment && (
          <Alert
            icon={CreditCard}
            on={prefs.paymentAlerts}
            title={`Payment failed: ${digest.failedPayment.name}`}
            meta={`${formatCurrency(digest.failedPayment.amount)} invoice · card declined`}
          />
        )}
        {digest.newTrial && (
          <Alert
            icon={UserPlus}
            on={prefs.signupAlerts}
            title={`New trial: ${digest.newTrial.name}`}
            meta={`Started the ${digest.newTrial.plan} plan`}
          />
        )}
      </div>
    </PreviewCard>
  );
}

function Alert({ icon: Icon, on, title, meta }: { icon: LucideIcon; on: boolean; title: string; meta: string }) {
  return (
    <div className={`flex items-center gap-3 px-3.5 py-3 transition-opacity ${on ? "" : "opacity-50"}`}>
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-fg">{title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{meta}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
          on ? "bg-success/10 text-success" : "bg-fg/5 text-muted-foreground"
        }`}
      >
        {on ? "On" : "Off"}
      </span>
    </div>
  );
}
