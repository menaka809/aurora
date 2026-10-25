"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Sparkles, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { NAV, NAV_GROUPS, isNavActive, type NavItem } from "@/lib/nav";
import { formatCurrency } from "@/lib/format";
import type { Goal } from "@/lib/data/types";
import UserMenu from "./UserMenu";

/** Opens the customers table on the built-in "At risk" view. */
const AT_RISK_HREF = "/customers?health=at_risk";

/** True when the key press is meant for a text field, not a shortcut. */
const isTyping = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
};

/** Tooltip on the right, only while the sidebar is collapsed and labels are hidden. */
function Tip({ show, label, children }: { show: boolean; label: ReactNode; children: ReactNode }) {
  if (!show) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function Sidebar({ atRisk, goal }: { atRisk: number; goal: Goal }) {
  const pathname = usePathname();
  const collapsedRaw = useUI((s) => s.sidebarCollapsed);
  const hydrated = useHydrated();
  const toggle = useUI((s) => s.toggleSidebar);
  const collapsed = hydrated ? collapsedRaw : false;

  // "[" collapses or expands the sidebar, like many desktop apps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "[" || e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const toggleLabel = (
    <span className="flex items-center gap-2">
      {collapsed ? "Expand sidebar" : "Collapse sidebar"}
      <kbd className="rounded border border-background/30 px-1 text-[10px]">[</kbd>
    </span>
  );

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-300 ease-out md:flex print:hidden ${
        collapsed ? "w-[74px]" : "w-64"
      }`}
    >
      {/* Brand row: same height and bottom border as the top bar, so the lines meet. */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-border ${
          collapsed ? "justify-center px-3" : "justify-between pl-4 pr-3"
        }`}
      >
        <Link
          href="/"
          aria-label="Aurora — go to overview"
          className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-solid to-chart-4 text-white shadow-[0_6px_16px_-6px] shadow-primary/70">
            <Sparkles className="size-[18px]" />
          </span>
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block font-semibold tracking-tight text-fg">Aurora</span>
              <span className="block truncate text-[11px] text-muted-foreground">Revenue analytics</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <Tip show label={toggleLabel}>
            <button
              type="button"
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg"
            >
              <PanelLeftClose className="size-[18px]" />
            </button>
          </Tip>
        )}
      </div>

      {/* Nav, in labelled groups */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group} className={gi > 0 ? "mt-4" : ""}>
            {collapsed ? (
              gi > 0 && <div aria-hidden className="mx-auto mb-4 h-px w-6 bg-border" />
            ) : (
              <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
            )}
            <ul className="space-y-0.5">
              {NAV.filter((item) => item.group === group).map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={isNavActive(item, pathname)}
                    collapsed={collapsed}
                    badge={item.href === "/customers" ? atRisk : 0}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && <GoalCard goal={goal} />}

      {/* Footer: account (and the expand button while collapsed) */}
      <div className="space-y-1 border-t border-border p-3">
        {collapsed && (
          <Tip show label={toggleLabel}>
            <button
              type="button"
              onClick={toggle}
              aria-label="Expand sidebar"
              className="flex h-10 w-full items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg"
            >
              <PanelLeftOpen className="size-[18px]" />
            </button>
          </Tip>
        )}
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  badge,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  /** At-risk count shown beside the item; 0 hides it. */
  badge: number;
}) {
  const Icon = item.icon;
  const tip = badge ? (
    <span>
      {item.label} · <span className="text-warning">{badge} at risk</span>
    </span>
  ) : (
    item.label
  );

  return (
    <div className="relative">
      <Tip show={collapsed} label={tip}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
          className={`relative flex h-10 items-center gap-3 rounded-lg text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 ${
            collapsed ? "justify-center" : "px-3"
          } ${active ? "font-medium text-fg" : "text-muted-foreground hover:bg-fg/5 hover:text-fg"}`}
        >
          {active && (
            <motion.span
              layoutId="nav-active"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute inset-0 rounded-lg bg-primary/10"
            >
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            </motion.span>
          )}
          <span className="relative">
            <Icon className={`size-[18px] shrink-0 ${active ? "text-primary" : ""}`} />
            {collapsed && badge > 0 && (
              <span className="absolute -right-1 -top-1 size-2 rounded-full bg-warning ring-2 ring-surface" />
            )}
          </span>
          {!collapsed && <span className="relative whitespace-nowrap">{item.label}</span>}
        </Link>
      </Tip>

      {/* A separate link, so the count jumps straight to the at-risk accounts. */}
      {!collapsed && badge > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={AT_RISK_HREF}
              aria-label={`${badge} customers at risk`}
              className="tabular absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning transition-colors hover:bg-warning/25"
            >
              {badge}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {badge} accounts at risk · view them
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

/** Progress towards the MRR goal; opens the Overview, where the full goal ring lives. */
function GoalCard({ goal }: { goal: Goal }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const toGo = Math.max(0, goal.target - goal.current);

  return (
    <Link
      href="/"
      className="mx-3 mb-3 block rounded-xl border border-border bg-gradient-to-br from-primary/10 via-transparent to-chart-4/10 p-3.5 outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Target className="size-3.5 text-primary" />
          MRR goal
        </span>
        <span className="tabular text-xs font-semibold text-fg">{pct}%</span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        <span className="tabular font-semibold text-fg">{formatCurrency(goal.current, true)}</span>
        {" of "}
        <span className="tabular">{formatCurrency(goal.target, true)}</span>
      </p>
      <div
        role="progressbar"
        aria-label="MRR goal progress"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-fg/10"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {toGo > 0 ? `${formatCurrency(toGo, true)} to go` : "Goal reached"}
      </p>
    </Link>
  );
}
