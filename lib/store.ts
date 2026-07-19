"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

type UIState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  hydrated: boolean;
  commandOpen: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setHydrated: () => void;
  setCommandOpen: (v: boolean) => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebarCollapsed: false,
      hydrated: false,
      commandOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setHydrated: () => set({ hydrated: true }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
    }),
    {
      name: "aurora-ui",
      partialize: (s) => ({
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
