"use client";

import { useEffect, useState } from "react";
import { Check, StickyNote, Trash2 } from "lucide-react";
import { Card, CardHeader } from "./Card";
import { formatDate } from "@/lib/format";
import type { Note } from "@/lib/customers";
import { DEFAULT_PROFILE, useUI } from "@/lib/store";
import { NOTE_MAX_LENGTH, formatNoteTime, useNotes, type UserNote } from "@/lib/notes-store";
import { useHydrated } from "@/lib/useHydrated";
import { toast } from "@/lib/toast";

const NO_NOTES: UserNote[] = [];

/** Internal notes: write a new one, see yours first, delete with a confirm step. */
export default function NotesCard({ customerId, seeded }: { customerId: string; seeded: Note[] }) {
  const hydrated = useHydrated();
  const stored = useNotes((s) => s.notes[customerId]);
  const addNote = useNotes((s) => s.addNote);
  const deleteNote = useNotes((s) => s.deleteNote);
  const profile = useUI((s) => s.profile);
  // Browser-saved notes and the author name only exist after hydration.
  const mine = hydrated ? (stored ?? NO_NOTES) : NO_NOTES;
  const author = hydrated ? profile.fullName : DEFAULT_PROFILE.fullName;

  const [text, setText] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  // A pending delete confirmation cancels itself after a few seconds.
  useEffect(() => {
    if (!confirming) return;
    const t = window.setTimeout(() => setConfirming(null), 4000);
    return () => window.clearTimeout(t);
  }, [confirming]);

  const save = () => {
    const value = text.trim();
    if (!value) return;
    addNote(customerId, { author, text: value });
    setText("");
    toast("Note added", { description: "Visible to your team only." });
  };

  const remaining = NOTE_MAX_LENGTH - text.length;
  const total = mine.length + seeded.length;

  return (
    <Card>
      <CardHeader
        title="Notes"
        subtitle={`Internal · not visible to customer${total ? ` · ${total}` : ""}`}
      />
      <div className="space-y-3 p-5 pt-4">
        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="rounded-lg border border-border bg-bg transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15"
        >
          <label htmlFor={`note-${customerId}`} className="sr-only">
            Add an internal note
          </label>
          <textarea
            id={`note-${customerId}`}
            value={text}
            maxLength={NOTE_MAX_LENGTH}
            rows={text ? 3 : 2}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                save();
              }
            }}
            placeholder="Add an internal note…"
            className="block w-full resize-none bg-transparent px-3 pt-2.5 text-sm text-fg outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <span
              className={`text-[11px] ${remaining < 50 ? "text-warning" : "text-muted-foreground"}`}
            >
              {text ? `${remaining} left · Ctrl+Enter to save` : "Only your team can see notes"}
            </span>
            <button
              type="submit"
              disabled={!text.trim()}
              className="rounded-md bg-primary-solid px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Save note
            </button>
          </div>
        </form>

        {/* Your notes first, newest on top */}
        {mine.map((n) => (
          <div
            key={n.id}
            className="group/note rounded-lg border border-primary/25 bg-primary/5 p-3"
          >
            <p className="whitespace-pre-wrap wrap-break-word text-sm text-fg">{n.text}</p>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="rounded bg-primary/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-primary">
                  You
                </span>
                {n.author} · {formatNoteTime(n.createdAt)}
              </span>
              {confirming === n.id ? (
                <button
                  onClick={() => {
                    deleteNote(customerId, n.id);
                    setConfirming(null);
                    toast("Note deleted", { type: "info" });
                  }}
                  className="flex items-center gap-1 rounded-md bg-danger/10 px-2 py-0.5 font-medium text-danger transition-colors hover:bg-danger/15"
                >
                  <Check className="size-3" />
                  Delete?
                </button>
              ) : (
                <button
                  aria-label="Delete note"
                  title="Delete note"
                  onClick={() => setConfirming(n.id)}
                  className="rounded-md p-1 opacity-0 transition-opacity hover:bg-fg/5 hover:text-fg focus-visible:opacity-100 group-hover/note:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {seeded.map((n) => (
          <div key={n.id} className="rounded-lg border border-border bg-elevated p-3">
            <p className="text-sm text-fg">{n.text}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {n.author} · {formatDate(n.date)}
            </p>
          </div>
        ))}

        {total === 0 && (
          <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <StickyNote className="size-4" />
            No notes yet
          </p>
        )}
      </div>
    </Card>
  );
}
