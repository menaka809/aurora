"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Keeps the <html> `light` class in sync with the persisted theme. The initial
 * theme is applied pre-paint by the inline script in the layout; this handles
 * every toggle afterwards.
 */
export default function ThemeSync() {
  const theme = useUI((s) => s.theme);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme, hydrated]);

  return null;
}
