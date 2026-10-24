"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LineChart,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import UserMenu from "./UserMenu";

type NavItem = { label: string; href: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsedRaw = useUI((s) => s.sidebarCollapsed);
  const hydrated = useHydrated();
  const toggle = useUI((s) => s.toggleSidebar);
  const collapsed = hydrated ? collapsedRaw : false;

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-300 ease-out md:flex print:hidden ${
        collapsed ? "w-[74px]" : "w-64"
      }`}
    >
      {/* Brand — click to return to the overview */}
      <Link
        href="/"
        aria-label="Aurora — go to overview"
        className="flex h-16 items-center gap-2.5 px-5 transition-opacity hover:opacity-80"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        {!collapsed && (
          <span className="font-semibold tracking-tight text-fg">Aurora</span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? "text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-lg border border-border bg-elevated"
                />
              )}
              <Icon
                className={`relative z-10 h-[18px] w-[18px] shrink-0 ${
                  active ? "text-primary" : ""
                }`}
              />
              {!collapsed && (
                <span className="relative z-10 whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: collapse toggle + account */}
      <div className="border-t border-border p-3">
        <button
          onClick={toggle}
          className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:text-fg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>

        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
