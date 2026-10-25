"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, Settings, Search, Moon, Sun, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_PROFILE, useUI } from "@/lib/store";
import { useResolvedTheme } from "@/lib/theme";
import { useHydrated } from "@/lib/useHydrated";
import { useIsMac } from "@/lib/useIsMac";
import { initials } from "@/lib/customers";

export default function UserMenu({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const toggleTheme = useUI((s) => s.toggleTheme);
  const setCommandOpen = useUI((s) => s.setCommandOpen);
  const storedProfile = useUI((s) => s.profile);
  const hydrated = useHydrated();
  const isMac = useIsMac();
  // Profile and theme live in localStorage; use defaults until hydrated.
  const profile = hydrated ? storedProfile : DEFAULT_PROFILE;
  const isLight = useResolvedTheme() === "light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${profile.fullName}`}
        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-fg/5 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-fg/5 ${collapsed ? "justify-center" : ""}`}
      >
        <span className="relative shrink-0">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials(profile.fullName)}
          </span>
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-surface" />
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm text-fg">{profile.fullName}</span>
              <span className="block truncate text-xs text-muted-foreground">{profile.company}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-60 p-1.5">
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <p className="truncate text-sm font-medium text-fg">{profile.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
          <span className="mt-1.5 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
            {profile.company} · {profile.role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => router.push("/settings")} className="px-2">
            <Settings />
            Profile &amp; settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCommandOpen(true)} className="px-2">
            <Search />
            Command palette
            <DropdownMenuShortcut>{isMac ? "⌘K" : "Ctrl K"}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            // Stay open so the theme change is visible immediately.
            onSelect={(e) => {
              e.preventDefault();
              toggleTheme();
            }}
            className="px-2"
          >
            {isLight ? <Moon /> : <Sun />}
            {isLight ? "Dark mode" : "Light mode"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => router.push("/login")}
          className="px-2"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
