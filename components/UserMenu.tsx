"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, Settings, Search, Moon, Sun, LogOut } from "lucide-react";
import Popover, { MenuItem, MenuLabel } from "./Popover";
import { DEFAULT_PROFILE, useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { initials } from "@/lib/customers";

export default function UserMenu({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const toggleTheme = useUI((s) => s.toggleTheme);
  const setCommandOpen = useUI((s) => s.setCommandOpen);
  const theme = useUI((s) => s.theme);
  const storedProfile = useUI((s) => s.profile);
  const hydrated = useHydrated();
  // Profile and theme live in localStorage; use defaults until hydrated.
  const profile = hydrated ? storedProfile : DEFAULT_PROFILE;
  const isLight = hydrated && theme === "light";

  return (
    <Popover
      side="top"
      align="left"
      width="w-60"
      trigger={
        <span className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-elevated">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials(profile.fullName)}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm text-fg">
                  {profile.fullName}
                </span>
                <span className="block truncate text-xs text-muted">
                  {profile.company}
                </span>
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
            </>
          )}
        </span>
      }
    >
      <div className="border-b border-border px-3 py-2.5">
        <p className="truncate text-sm font-medium text-fg">{profile.fullName}</p>
        <p className="truncate text-xs text-muted">{profile.email}</p>
        <span className="mt-1.5 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
          {profile.company} · {profile.role}
        </span>
      </div>

      <div className="pt-1">
        <MenuLabel>Account</MenuLabel>
        <MenuItem icon={Settings} onClick={() => router.push("/settings")}>
          Profile &amp; settings
        </MenuItem>
        <MenuItem icon={Search} onClick={() => setCommandOpen(true)}>
          Command palette
        </MenuItem>
        <MenuItem icon={isLight ? Moon : Sun} onClick={toggleTheme}>
          {isLight ? "Dark mode" : "Light mode"}
        </MenuItem>
      </div>

      <div className="mt-1 border-t border-border pt-1">
        <MenuItem icon={LogOut} danger onClick={() => router.push("/login")}>
          Sign out
        </MenuItem>
      </div>
    </Popover>
  );
}
