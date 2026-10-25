"use client";

import { useId } from "react";
import { CreditCard, Mail, UserPlus, type LucideIcon } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_NOTIFICATIONS, DEFAULT_PROFILE, useUI, type NotificationPrefs } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

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

export default function NotificationsSection() {
  const hydrated = useHydrated();
  const stored = useUI((s) => s.notifications);
  const email = useUI((s) => s.profile.email);
  const setNotification = useUI((s) => s.setNotification);
  const prefs = hydrated ? stored : DEFAULT_NOTIFICATIONS;

  return (
    <SettingsSection
      id="notifications"
      title="Email notifications"
      description={`Sent to ${hydrated ? email : DEFAULT_PROFILE.email}. Each switch saves on its own.`}
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
