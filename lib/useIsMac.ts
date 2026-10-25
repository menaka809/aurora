"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const isMacClient = () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

/** True on Apple platforms (after hydration), for showing ⌘ vs Ctrl shortcuts. */
export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, isMacClient, () => false);
}
