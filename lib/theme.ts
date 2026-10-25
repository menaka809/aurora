"use client";

import { useSyncExternalStore } from "react";
import { useUI, type Theme } from "@/lib/store";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

/** The theme actually shown: "system" follows the OS setting. */
export function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme !== "system") return theme;
  return typeof window !== "undefined" && window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

function subscribeToOs(onChange: () => void) {
  const mq = window.matchMedia(LIGHT_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * The resolved theme, updating live when the OS theme changes (for "system").
 * Server and hydration render use "dark", the app's default, so markup matches.
 */
export function useResolvedTheme(): "dark" | "light" {
  const theme = useUI((s) => s.theme);
  const osLight = useSyncExternalStore(
    subscribeToOs,
    () => window.matchMedia(LIGHT_QUERY).matches,
    () => false
  );
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!hydrated) return "dark";
  return theme === "system" ? (osLight ? "light" : "dark") : theme;
}
