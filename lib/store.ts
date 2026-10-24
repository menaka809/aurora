"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan } from "@/lib/customers";

export type Theme = "dark" | "light";

export type Profile = {
  fullName: string;
  email: string;
  company: string;
  role: "Admin" | "Editor" | "Viewer";
  timezone: string;
  bio: string;
};

export const DEFAULT_PROFILE: Profile = {
  fullName: "Jordan Blake",
  email: "jordan@example.com",
  company: "Aurora Labs",
  role: "Admin",
  timezone: "UTC−05:00 · Eastern",
  bio: "Head of Growth. I live in the dashboard.",
};

/** A plan change that applies from the given date (ISO). */
export type PlanChange = { plan: Plan; effective: string };

type UIState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  profile: Profile;
  planChanges: Record<string, PlanChange>;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setCommandOpen: (v: boolean) => void;
  setProfile: (p: Profile) => void;
  schedulePlanChange: (customerId: string, change: PlanChange) => void;
  cancelPlanChange: (customerId: string) => void;
};

// Demo-only persistence in localStorage; Phase 4 moves profile and plan
// changes to the database.
export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebarCollapsed: false,
      commandOpen: false,
      profile: DEFAULT_PROFILE,
      planChanges: {},
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setProfile: (profile) => set({ profile }),
      schedulePlanChange: (id, change) =>
        set((s) => ({ planChanges: { ...s.planChanges, [id]: change } })),
      cancelPlanChange: (id) =>
        set((s) => {
          const next = { ...s.planChanges };
          delete next[id];
          return { planChanges: next };
        }),
    }),
    {
      name: "aurora-ui",
      partialize: (s) => ({
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
        profile: s.profile,
        planChanges: s.planChanges,
      }),
    }
  )
);
