"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "./ui/Modal";
import { PLANS, type CustomerProfile, type Plan } from "@/lib/customers";
import { formatDate } from "@/lib/format";
import { useUI } from "@/lib/store";
import { toast } from "@/lib/toast";

const BLURB: Record<Plan, string> = {
  Starter: "Core dashboards for small teams",
  Growth: "Funnels, cohorts and exports",
  Scale: "SSO, API access and audit log",
  Enterprise: "Custom contracts and a dedicated CSM",
};

export default function ManagePlanDialog({
  open,
  onOpenChange,
  customer: c,
  today,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerProfile;
  today: string;
}) {
  const scheduled = useUI((s) => s.planChanges[c.id]);
  const schedulePlanChange = useUI((s) => s.schedulePlanChange);
  const [selected, setSelected] = useState<Plan>(scheduled?.plan ?? c.plan);

  // Paying accounts switch at their next invoice; others switch right away.
  const effective = c.nextInvoice ?? today;
  const reactivating = c.status === "churned";
  const unchanged = selected === c.plan && !reactivating;

  const confirm = () => {
    schedulePlanChange(c.id, { plan: selected, effective });
    onOpenChange(false);
    toast(reactivating ? "Reactivation scheduled" : "Plan change scheduled", {
      description:
        effective === today
          ? `${c.name} moves to ${selected} today.`
          : `${c.name} moves to ${selected} on ${formatDate(effective)}.`,
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={reactivating ? `Reactivate ${c.company}` : `Change plan for ${c.company}`}
      description={
        effective === today
          ? "The new plan applies immediately."
          : `Changes take effect on the next invoice, ${formatDate(effective)}.`
      }
    >
      <div role="radiogroup" aria-label="Plan" className="space-y-2">
        {PLANS.map((plan) => {
          const active = plan === selected;
          return (
            <button
              key={plan}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(plan)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-primary/60 bg-primary/10"
                  : "border-border hover:bg-surface"
              }`}
            >
              <span>
                <span className="flex items-center gap-2 text-sm font-medium text-fg">
                  {plan}
                  {plan === c.plan && (
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Current
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{BLURB[plan]}</span>
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:bg-surface"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={unchanged}
          className="rounded-lg bg-primary-solid px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {reactivating ? "Reactivate" : "Confirm change"}
        </button>
      </div>
    </Modal>
  );
}
