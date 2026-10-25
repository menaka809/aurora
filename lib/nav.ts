import { LayoutDashboard, LineChart, Settings, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** One-line page description shown under the title in the top bar. */
  subtitle: string;
  /** Whether the page reads the shared 7/30/90-day range. */
  usesRange?: boolean;
};

/** The app's main pages: sidebar, mobile nav, command palette and top bar all use this. */
export const NAV: NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
    subtitle: "Your growth, in motion.",
    usesRange: true,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: LineChart,
    subtitle: "Revenue and engagement trends.",
    usesRange: true,
  },
  { label: "Customers", href: "/customers", icon: Users, subtitle: "Accounts and their health." },
  { label: "Settings", href: "/settings", icon: Settings, subtitle: "Manage your workspace." },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

/** The nav item a path belongs to (nested pages map to their section). */
export function navItemFor(pathname: string): NavItem {
  return NAV.find((item) => item.href !== "/" && pathname.startsWith(item.href)) ?? NAV[0];
}
