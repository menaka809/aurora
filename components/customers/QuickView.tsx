"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, Mail } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/StatusBadge";
import ManagePlanDialog from "@/components/ManagePlanDialog";
import MessageSheet from "@/components/MessageSheet";
import { avatarColor, initials, type CustomerProfile } from "@/lib/customers";
import { formatCurrency, formatDate, formatDaysAgo } from "@/lib/format";
import { formatNoteTime, useNotes } from "@/lib/notes-store";
import { useHydrated } from "@/lib/useHydrated";
import type { TableRow } from "./columns";

type Basics = Pick<
  TableRow,
  "id" | "name" | "email" | "company" | "plan" | "mrr" | "status" | "seats" | "lastLoginDays" | "ltv"
>;

/**
 * Side drawer for a customer, opened from the table without leaving it.
 * Shows the row's data straight away and fills in the profile once loaded.
 */
export default function QuickView({
  row,
  profile,
  tags,
  today,
  onClose,
}: {
  row: Basics | null;
  profile: CustomerProfile | null;
  tags: string[];
  today: string;
  onClose: () => void;
}) {
  const [planOpen, setPlanOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const c: Basics | null = profile ?? row;

  // Your newest note wins over the seeded one (browser-saved, so after hydration).
  const hydrated = useHydrated();
  const myNote = useNotes((s) => (c ? s.notes[c.id]?.[0] : undefined));
  const latestNote =
    hydrated && myNote
      ? { text: myNote.text, author: myNote.author, when: formatNoteTime(myNote.createdAt), mine: true }
      : profile?.notes[0]
      ? {
          text: profile.notes[0].text,
          author: profile.notes[0].author,
          when: formatDate(profile.notes[0].date),
          mine: false,
        }
      : null;

  return (
    <Modal
      open={Boolean(c)}
      onOpenChange={(o) => !o && onClose()}
      side="right"
      title={c?.name ?? "Customer"}
      description={c ? `${c.company} · ${c.email}` : undefined}
    >
      {c && (
        <div className="-mx-6 flex-1 space-y-6 overflow-y-auto px-6 pb-2">
          <div className="flex items-center gap-3">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
              style={{ background: avatarColor(c.name) }}
            >
              {initials(c.name)}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={c.status} />
              <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {c.plan}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {[
              ["MRR", c.mrr ? formatCurrency(c.mrr) : "—"],
              ["Lifetime value", formatCurrency(c.ltv)],
              ["Seats", String(c.seats)],
              ["Last seen", formatDaysAgo(c.lastLoginDays)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="tabular mt-0.5 text-base font-semibold text-fg">{value}</dd>
              </div>
            ))}
          </dl>

          {profile?.nextInvoice && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-4 shrink-0" />
              Next invoice {formatDate(profile.nextInvoice)} · {profile.manager}
            </p>
          )}

          {(profile || tags.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {[...(profile?.tags ?? []), ...tags].map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-elevated px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recent activity
            </h3>
            {profile ? (
              <ol className="space-y-3">
                {profile.timeline.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 text-fg">
                      {e.title}
                      {e.meta && e.kind === "payment" && (
                        <span className="tabular ml-1.5 text-muted-foreground">{e.meta}</span>
                      )}
                    </span>
                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                      {formatDate(e.date)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="space-y-2.5" aria-label="Loading activity">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            )}
          </section>

          {latestNote && (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Latest note
              </h3>
              <div
                className={`rounded-lg border p-3 ${
                  latestNote.mine ? "border-primary/25 bg-primary/5" : "border-border bg-surface"
                }`}
              >
                <p className="line-clamp-4 whitespace-pre-wrap wrap-break-word text-sm text-fg">
                  {latestNote.text}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {latestNote.mine && (
                    <span className="mr-1.5 rounded bg-primary/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-primary">
                      You
                    </span>
                  )}
                  {latestNote.author} · {latestNote.when}
                </p>
              </div>
            </section>
          )}
        </div>
      )}

      {c && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            onClick={() => setMessageOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-fg transition-colors hover:bg-surface"
          >
            <Mail className="size-4" />
            Message
          </button>
          <button
            onClick={() => setPlanOpen(true)}
            disabled={!profile}
            className="rounded-lg border border-border px-3 py-2 text-sm text-fg transition-colors hover:bg-surface disabled:opacity-40"
          >
            {c.status === "churned" ? "Reactivate" : "Manage plan"}
          </button>
          <Link
            href={`/customers/${c.id}`}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary-solid px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Full profile
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      )}

      {c && (
        <MessageSheet open={messageOpen} onOpenChange={setMessageOpen} recipients={[c]} />
      )}
      {planOpen && profile && (
        <ManagePlanDialog open onOpenChange={setPlanOpen} customer={profile} today={today} />
      )}
    </Modal>
  );
}
