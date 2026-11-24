"use client";

import { useState, useSyncExternalStore } from "react";
import { Tabs } from "radix-ui";
import { Bell, Palette, UserRound, type LucideIcon } from "lucide-react";
import ProfileSection from "./ProfileSection";
import AppearanceSection from "./AppearanceSection";
import NotificationsSection from "./NotificationsSection";
import type { WeeklyDigest } from "@/lib/data/types";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

type SectionId = (typeof SECTIONS)[number]["id"];
const isSection = (v: string): v is SectionId => SECTIONS.some((s) => s.id === v);

// The open tab lives in the URL hash (/settings#appearance), so a refresh or a
// shared link opens the same tab.
const hashListeners = new Set<() => void>();
function subscribeHash(onChange: () => void) {
  hashListeners.add(onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    hashListeners.delete(onChange);
    window.removeEventListener("hashchange", onChange);
  };
}
const readHash = () => window.location.hash.slice(1);
function writeHash(id: SectionId) {
  // Passing the router's own state keeps Next.js from treating this as a navigation.
  window.history.replaceState(window.history.state, "", `#${id}`);
  hashListeners.forEach((l) => l());
}

/** Vertical list on large screens, a row of tabs on small ones (sets the arrow-key axis). */
const LARGE = "(min-width: 1024px)";
function subscribeLarge(onChange: () => void) {
  const mq = window.matchMedia(LARGE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function SettingsView({ digest }: { digest: WeeklyDigest }) {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const active: SectionId = isSection(hash) ? hash : "profile";
  const large = useSyncExternalStore(
    subscribeLarge,
    () => window.matchMedia(LARGE).matches,
    () => true
  );
  // Unsaved profile edits survive tab switches; the Profile tab shows a dot.
  const [profileDirty, setProfileDirty] = useState(false);

  const select = (id: string) => {
    if (!isSection(id)) return;
    writeHash(id);
    // On phones the tabs can be far down the page; bring the new panel into view.
    const panel = document.getElementById("settings-panels");
    if (panel && panel.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <Tabs.Root
      value={active}
      onValueChange={select}
      orientation={large ? "vertical" : "horizontal"}
      className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8"
    >
      {/* Sticky tabs on small screens, a sidebar list on large ones. */}
      <Tabs.List
        aria-label="Settings sections"
        className="sticky top-16 z-20 -mx-4 mb-4 flex gap-1 overflow-x-auto border-b border-border bg-bg/95 px-4 py-2 [scrollbar-width:none] sm:-mx-5 sm:px-5 md:-mx-8 md:px-8 lg:top-22 lg:mx-0 lg:mb-0 lg:flex-col lg:self-start lg:border-0 lg:bg-transparent lg:p-0"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <Tabs.Trigger
            key={id}
            value={id}
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-fg/5 hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:bg-primary/10 data-[state=active]:font-medium data-[state=active]:text-primary sm:px-3"
          >
            {/* Icons only where there is room, so the tabs fit on a phone. */}
            <Icon className="hidden size-4 shrink-0 sm:block" />
            {label}
            {id === "profile" && profileDirty && (
              <>
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />
                <span className="sr-only">(unsaved changes)</span>
              </>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div id="settings-panels" className="min-w-0">
        {/* Panels stay mounted (just hidden) so unsaved edits aren't lost on a switch. */}
        <Tabs.Content value="profile" forceMount className="settings-panel outline-none data-[state=inactive]:hidden">
          <ProfileSection onDirtyChange={setProfileDirty} />
        </Tabs.Content>
        <Tabs.Content value="appearance" forceMount className="settings-panel outline-none data-[state=inactive]:hidden">
          <AppearanceSection digest={digest} />
        </Tabs.Content>
        <Tabs.Content value="notifications" forceMount className="settings-panel outline-none data-[state=inactive]:hidden">
          <NotificationsSection digest={digest} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
