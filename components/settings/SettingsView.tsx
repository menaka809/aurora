"use client";

import { useEffect, useState } from "react";
import { Bell, Database, Palette, UserRound, type LucideIcon } from "lucide-react";
import ProfileSection from "./ProfileSection";
import AppearanceSection from "./AppearanceSection";
import NotificationsSection from "./NotificationsSection";
import DemoDataSection from "./DemoDataSection";

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "demo-data", label: "Demo data", icon: Database },
];

/** A section counts as current once its top passes this line (px from the top). */
const SPY_OFFSET = 160;

/** Highlights the section being read; the last one wins at the bottom of the page. */
function useActiveSection() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) return setActive(SECTIONS[SECTIONS.length - 1].id);
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= SPY_OFFSET) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return [active, setActive] as const;
}

export default function SettingsView() {
  const [active, setActive] = useActiveSection();

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <div className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
      {/* Section menu: sticky tabs on small screens, a sidebar list on large ones. */}
      <nav
        aria-label="Settings sections"
        className="sticky top-16 z-20 -mx-4 mb-4 border-b border-border bg-bg/95 px-4 sm:-mx-5 sm:px-5 md:-mx-8 md:px-8 lg:top-22 lg:mx-0 lg:mb-0 lg:self-start lg:border-0 lg:bg-transparent lg:px-0"
      >
        <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] lg:flex-col lg:py-0">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const current = active === id;
            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  onClick={go(id)}
                  aria-current={current ? "true" : undefined}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm sm:px-3 transition-colors ${
                    current
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-fg/5 hover:text-fg"
                  }`}
                >
                  {/* Icons only where there is room, so all four tabs fit on a phone. */}
                  <Icon className="hidden size-4 shrink-0 sm:block" />
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 hidden px-3 text-xs leading-relaxed text-muted-foreground lg:block">
          Settings are saved in this browser for the demo.
        </p>
      </nav>

      <div className="min-w-0 space-y-4 md:space-y-5">
        <ProfileSection />
        <AppearanceSection />
        <NotificationsSection />
        <DemoDataSection />
      </div>
    </div>
  );
}
