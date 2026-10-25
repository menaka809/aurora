"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SettingsSection from "./SettingsSection";
import ChoiceCards, { type Choice } from "./ChoiceCards";
import { useUI, type Theme } from "@/lib/store";
import { useCustomerTable, type Density } from "@/lib/table-store";
import { useHydrated } from "@/lib/useHydrated";

// Fixed palettes so each preview shows its theme whatever is active now.
const PALETTES = {
  dark: { bg: "#0a0b0f", surface: "#14161f", line: "#2a2e3a", text: "#edeef2", accent: "#5b8def" },
  light: { bg: "#f6f7f9", surface: "#ffffff", line: "#e6e8ee", text: "#14161f", accent: "#3a6ad0" },
};

/** A tiny dashboard: sidebar, title and a chart card. */
function MiniDashboard({ theme }: { theme: keyof typeof PALETTES }) {
  const p = PALETTES[theme];
  return (
    <div className="flex h-full gap-1.5 p-2" style={{ background: p.bg }}>
      <div className="w-1/5 space-y-1 rounded-sm p-1" style={{ background: p.surface }}>
        <div className="h-1 w-full rounded-full" style={{ background: p.accent }} />
        <div className="h-1 w-3/4 rounded-full" style={{ background: p.line }} />
        <div className="h-1 w-3/4 rounded-full" style={{ background: p.line }} />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-1.5 w-1/2 rounded-full" style={{ background: p.text, opacity: 0.8 }} />
        <div className="rounded-sm p-1.5" style={{ background: p.surface }}>
          <svg viewBox="0 0 60 20" className="h-6 w-full" preserveAspectRatio="none">
            <path d="M0 16 L12 12 L24 14 L36 7 L48 9 L60 3" fill="none" stroke={p.accent} strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const THEMES: Choice<Theme>[] = [
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes in low light.",
    preview: <div className="h-20"><MiniDashboard theme="dark" /></div>,
  },
  {
    value: "light",
    label: "Light",
    description: "Crisp and bright for daytime.",
    preview: <div className="h-20"><MiniDashboard theme="light" /></div>,
  },
  {
    value: "system",
    label: "System",
    description: "Follows your device setting.",
    preview: (
      <div className="relative h-20">
        <div className="absolute inset-0"><MiniDashboard theme="light" /></div>
        {/* Dark half, split on the diagonal */}
        <div className="absolute inset-0" style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 45% 100%)" }}>
          <MiniDashboard theme="dark" />
        </div>
      </div>
    ),
  },
];

/** Table rows at the given spacing. */
function MiniRows({ compact }: { compact: boolean }) {
  return (
    <div className={`flex h-20 flex-col justify-center bg-surface px-3 ${compact ? "gap-1" : "gap-2.5"}`}>
      {Array.from({ length: compact ? 6 : 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={`shrink-0 rounded-full bg-primary/40 ${compact ? "size-1.5" : "size-3"}`} />
          <span className={`flex-1 rounded-full bg-fg/15 ${compact ? "h-1" : "h-1.5"}`} />
          <span className={`w-6 rounded-full bg-fg/10 ${compact ? "h-1" : "h-1.5"}`} />
        </div>
      ))}
    </div>
  );
}

const DENSITIES: Choice<Density>[] = [
  {
    value: "comfortable",
    label: "Comfortable",
    description: "Roomier rows that are easy to scan.",
    preview: <MiniRows compact={false} />,
  },
  {
    value: "compact",
    label: "Compact",
    description: "More customers on screen at once.",
    preview: <MiniRows compact />,
  },
];

export default function AppearanceSection() {
  const hydrated = useHydrated();
  const theme = useUI((s) => s.theme);
  const setTheme = useUI((s) => s.setTheme);
  const density = useCustomerTable((s) => s.density);
  const setDensity = useCustomerTable((s) => s.setDensity);

  return (
    <SettingsSection
      id="appearance"
      title="Appearance"
      description="Changes apply instantly and are remembered on this device."
    >
      <div className="space-y-7">
        <div>
          <h3 className="text-sm font-medium text-fg">Theme</h3>
          <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
            You can also switch from the top bar or with the command palette.
          </p>
          <ChoiceCards label="Theme" value={hydrated ? theme : ""} onChange={setTheme} choices={THEMES} />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div>
              <h3 className="text-sm font-medium text-fg">Table density</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">How tightly rows are packed in the customers table.</p>
            </div>
            <Link
              href="/customers"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open customers
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <ChoiceCards
            label="Table density"
            value={hydrated ? density : ""}
            onChange={setDensity}
            choices={DENSITIES}
            columns={2}
          />
        </div>
      </div>
    </SettingsSection>
  );
}
