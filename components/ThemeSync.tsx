"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { resolveTheme } from "@/lib/theme";

/**
 * Keeps the <html> `light` class in sync with the persisted theme. The first
 * paint is handled by the inline script in the layout; this handles every
 * change afterwards, including OS changes while "system" is selected.
 */
export default function ThemeSync() {
  const theme = useUI((s) => s.theme);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const apply = () =>
      document.documentElement.classList.toggle("light", resolveTheme(theme) === "light");
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, hydrated]);

  return null;
}
