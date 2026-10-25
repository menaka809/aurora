"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import SettingsSection from "./SettingsSection";
import Modal from "@/components/ui/Modal";
import { DEFAULT_NOTIFICATIONS, DEFAULT_PROFILE, useUI } from "@/lib/store";
import { DEFAULT_COLUMNS, useCustomerTable } from "@/lib/table-store";
import { useNotes } from "@/lib/notes-store";
import { useHydrated } from "@/lib/useHydrated";
import { toast } from "@/lib/toast";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** What this browser has changed compared with the seeded demo. */
function useSavedChanges(): string[] {
  const hydrated = useHydrated();
  const { profile, planChanges, notifications } = useUI();
  const { columns, savedViews, managerOverrides, tagOverrides } = useCustomerTable();
  const notes = useNotes((s) => s.notes);
  if (!hydrated) return [];

  const noteCount = Object.values(notes).reduce((n, list) => n + list.length, 0);
  const plans = Object.keys(planChanges).length;
  const edited = new Set([...Object.keys(managerOverrides), ...Object.keys(tagOverrides)]).size;

  return [
    !same(profile, DEFAULT_PROFILE) && "Profile details",
    !same(notifications, DEFAULT_NOTIFICATIONS) && "Notification choices",
    noteCount > 0 && plural(noteCount, "customer note"),
    plans > 0 && plural(plans, "scheduled plan change"),
    savedViews.length > 0 && plural(savedViews.length, "saved view"),
    edited > 0 && `Manager or tag edits on ${plural(edited, "customer")}`,
    !same(columns, DEFAULT_COLUMNS) && "Customers table column layout",
  ].filter((x): x is string => Boolean(x));
}

export default function DemoDataSection() {
  const changes = useSavedChanges();
  const [open, setOpen] = useState(false);
  // Frozen when the dialog opens, so the list does not empty while it closes.
  const [pending, setPending] = useState<string[]>([]);

  const reset = () => {
    useUI.getState().resetAccount();
    useNotes.setState({ notes: {} });
    useCustomerTable.setState({
      columns: DEFAULT_COLUMNS,
      savedViews: [],
      managerOverrides: {},
      tagOverrides: {},
    });
    setOpen(false);
    toast("Demo data reset", { description: "Everything is back to the original demo." });
  };

  return (
    <SettingsSection
      id="demo-data"
      title="Demo data"
      description="This demo keeps your edits in this browser only. Nothing is sent to a server."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {changes.length > 0 ? (
            <>
              <p className="text-sm font-medium text-fg">Saved in this browser</p>
              <ul className="mt-2 space-y-1">
                {changes.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-success" />
              You&apos;re using the original demo data. Nothing to reset.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setPending(changes);
            setOpen(true);
          }}
          disabled={changes.length === 0}
          className="flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-danger/40 px-3.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="size-4" />
          Reset demo data
        </button>
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Reset demo data?"
        description="This clears everything below from this browser. It can't be undone."
      >
        <ul className="space-y-1.5 rounded-lg border border-border bg-bg p-3">
          {pending.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-fg">
              <span className="size-1.5 shrink-0 rounded-full bg-danger" />
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Your theme, table density and sidebar setting are kept.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-9 rounded-lg px-3.5 text-sm text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={reset}
            // Darker red than --danger so white text passes AA in both themes.
            className="h-9 rounded-lg bg-[#c9363d] px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Reset everything
          </button>
        </div>
      </Modal>
    </SettingsSection>
  );
}
