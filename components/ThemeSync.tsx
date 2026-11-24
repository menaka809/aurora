"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { resolveTheme } from "@/lib/theme";

/**
 * Keeps the <html> `light` class in sync with the persisted theme. The first
 * paint is handled by the inline script in the layout; this handles every
 * change afterwards, including OS changes while "system" is selected.
 *
 * Changes cross-fade the whole screen in one go (View Transitions API), so no
 * part of the page is briefly left in the old theme.
 */
export default function ThemeSync() {
  const theme = useUI((s) => s.theme);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const apply = () => {
      const root = document.documentElement;
      const light = resolveTheme(theme) === "light";
      if (root.classList.contains("light") === light) return;

      const swap = () => {
        root.classList.add("theme-switching");
        root.classList.toggle("light", light);
        // Give hover/focus transitions back once the new colours are painted.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => root.classList.remove("theme-switching"))
        );
      };
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !document.startViewTransition) swap();
      else document.startViewTransition(swap);
    };
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, hydrated]);

  return null;
}
