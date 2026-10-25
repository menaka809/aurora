"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A note written in this browser (the seeded notes come from the server). */
export type UserNote = {
  id: string;
  author: string;
  text: string;
  /** ISO timestamp. */
  createdAt: string;
};

export const NOTE_MAX_LENGTH = 500;

type NotesState = {
  notes: Record<string, UserNote[]>;
  addNote: (customerId: string, note: Omit<UserNote, "id" | "createdAt">) => void;
  deleteNote: (customerId: string, noteId: string) => void;
};

// Demo-only persistence in localStorage; Phase 4 moves notes to the database
// behind a server action.
export const useNotes = create<NotesState>()(
  persist(
    (set) => ({
      notes: {},
      addNote: (customerId, note) =>
        set((s) => ({
          notes: {
            ...s.notes,
            [customerId]: [
              { ...note, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
              ...(s.notes[customerId] ?? []),
            ],
          },
        })),
      deleteNote: (customerId, noteId) =>
        set((s) => ({
          notes: {
            ...s.notes,
            [customerId]: (s.notes[customerId] ?? []).filter((n) => n.id !== noteId),
          },
        })),
    }),
    { name: "aurora-notes" }
  )
);

/** "Just now", "5m ago", "3h ago", then a date. */
export function formatNoteTime(iso: string, now = Date.now()): string {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
