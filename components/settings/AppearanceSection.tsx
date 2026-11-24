"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SettingsSection, { PreviewCard, SettingsPanel } from "./SettingsSection";
import ChoiceCards, { type Choice } from "./ChoiceCards";
import Sparkline from "@/components/charts/Sparkline";
import DeltaBadge from "@/components/DeltaBadge";
import { useUI, type Theme } from "@/lib/store";
import { useCustomerTable, type Density } from "@/lib/table-store";
import { useHydrated } from "@/lib/useHydrated";
import { useResolvedTheme } from "@/lib/theme";
import { avatarColor, initials } from "@/lib/customers";
import { formatCurrency } from "@/lib/format";
import type { WeeklyDigest } from "@/lib/data/types";

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

export default function AppearanceSection({ digest }: { digest: WeeklyDigest }) {
  const hydrated = useHydrated();
  const theme = useUI((s) => s.theme);
  const setTheme = useUI((s) => s.setTheme);
  const density = useCustomerTable((s) => s.density);
  const setDensity = useCustomerTable((s) => s.setDensity);

  return (
    <SettingsPanel
      preview={
        <AppearancePreview
          digest={digest}
          theme={hydrated ? theme : "dark"}
          density={hydrated ? density : "comfortable"}
        />
      }
    >
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
    </SettingsPanel>
  );
}

const THEME_NAME: Record<Theme, string> = { dark: "Dark", light: "Light", system: "System" };

/** The real dashboard pieces, drawn small, in the active theme and density. */
function AppearancePreview({
  digest,
  theme,
  density,
}: {
  digest: WeeklyDigest;
  theme: Theme;
  density: Density;
}) {
  const resolved = useResolvedTheme();
  const compact = density === "compact";
  const mrr = digest.kpis.find((k) => k.key === "mrr")!;

  return (
    <PreviewCard
      title="Dashboard & table"
      tip={
        theme === "system"
          ? `Following your device, which is in ${resolved} mode right now. Try another theme or row size and watch it change.`
          : "Try another theme or row size and watch it change here."
      }
    >
      <div className="card-shadow overflow-hidden rounded-xl border border-border bg-bg">
        {/* Browser-window frame */}
        <div aria-hidden className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
          <span className="size-2 rounded-full bg-fg/15" />
          <span className="size-2 rounded-full bg-fg/15" />
          <span className="size-2 rounded-full bg-fg/15" />
          <span className="ml-2 flex-1 truncate rounded-md bg-fg/[0.05] px-2 py-0.5 text-center text-[10px] text-muted-foreground">
            aurora · {THEME_NAME[theme].toLowerCase()} · {compact ? "compact" : "comfortable"}
          </span>
        </div>
        <div className="space-y-3 p-3">
          <div className="rounded-lg border border-border bg-surface p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
                <p className="tabular mt-1 text-lg font-semibold text-fg">{formatCurrency(mrr.value)}</p>
              </div>
              <DeltaBadge
                value={mrr.delta}
                up={mrr.direction === "up"}
                good={(mrr.direction === "up") === mrr.positiveIsGood}
              />
            </div>
            <Sparkline data={mrr.spark} color="var(--chart-1)" className="mt-2 h-10 w-full" />
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="flex justify-between border-b border-border px-3.5 py-2 text-[11px] font-medium text-muted-foreground">
              <span>Customer</span>
              <span>MRR</span>
            </div>
            {digest.topAccounts.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2.5 border-b border-border px-3.5 transition-[padding] duration-200 last:border-0 ${
                  compact ? "py-1.5" : "py-2.5"
                }`}
              >
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white transition-all duration-200 ${
                    compact ? "size-5 text-[8px]" : "size-7 text-[10px]"
                  }`}
                  style={{ background: avatarColor(c.name) }}
                >
                  {initials(c.name)}
                </span>
                <div className={`min-w-0 flex-1 ${compact ? "flex items-baseline gap-2" : ""}`}>
                  <p className="truncate text-xs text-fg">{c.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{c.company}</p>
                </div>
                <span className="tabular text-xs text-fg">{formatCurrency(c.mrr)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewCard>
  );
}
