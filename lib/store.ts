"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan } from "@/lib/customers";

/** "system" follows the OS light/dark setting. */
export type Theme = "dark" | "light" | "system";

export type NotificationPrefs = {
  weeklyDigest: boolean;
  paymentAlerts: boolean;
  signupAlerts: boolean;
};

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  weeklyDigest: true,
  paymentAlerts: true,
  signupAlerts: false,
};

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
  notifications: NotificationPrefs;
  setTheme: (t: Theme) => void;
  /** Flip between dark and light, starting from what is currently shown. */
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setCommandOpen: (v: boolean) => void;
  setProfile: (p: Profile) => void;
  schedulePlanChange: (customerId: string, change: PlanChange) => void;
  cancelPlanChange: (customerId: string) => void;
  setNotification: (key: keyof NotificationPrefs, on: boolean) => void;
  /** Back to the seeded demo account (theme and sidebar are kept). */
  resetAccount: () => void;
};

const showsLight = (theme: Theme) =>
  theme === "light" ||
  (theme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);

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
      notifications: DEFAULT_NOTIFICATIONS,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: showsLight(s.theme) ? "dark" : "light" })),
      setNotification: (key, on) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: on } })),
      resetAccount: () =>
        set({ profile: DEFAULT_PROFILE, planChanges: {}, notifications: DEFAULT_NOTIFICATIONS }),
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
        notifications: s.notifications,
      }),
    }
  )
);
