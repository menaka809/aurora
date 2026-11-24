"use client";

import { useRouter } from "next/navigation";
import { Building2, ChevronsUpDown, Moon, Palette, Search, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_PROFILE, useUI } from "@/lib/store";
import { useResolvedTheme } from "@/lib/theme";
import { useHydrated } from "@/lib/useHydrated";
import { useIsMac } from "@/lib/useIsMac";
import { avatarColor, initials } from "@/lib/customers";

const itemCls = "gap-3 rounded-lg px-2.5 py-2 text-[13px] text-fg [&_svg]:text-muted-foreground";

/** Avatar with initials and an online dot; the same colour everywhere the user appears. */
function Avatar({ name, size }: { name: string; size: "sm" | "md" }) {
  return (
    <span className="relative shrink-0">
      <span
        className={`flex items-center justify-center rounded-full font-semibold text-white ${
          size === "md" ? "size-10 text-sm" : "size-8 text-xs"
        }`}
        style={{ background: avatarColor(name) }}
      >
        {initials(name)}
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-surface" />
    </span>
  );
}

/** A shortcut drawn as keycaps, e.g. Ctrl + K. */
function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="ml-auto flex gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="min-w-5 rounded border border-border bg-fg/[0.04] px-1 py-px text-center font-sans text-[10px] font-medium text-muted-foreground"
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}

export default function UserMenu({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const toggleTheme = useUI((s) => s.toggleTheme);
  const setCommandOpen = useUI((s) => s.setCommandOpen);
  const storedProfile = useUI((s) => s.profile);
  const hydrated = useHydrated();
  const isMac = useIsMac();
  // Profile and theme live in localStorage; use defaults until hydrated.
  const profile = hydrated ? storedProfile : DEFAULT_PROFILE;
  const isDark = useResolvedTheme() === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${profile.fullName}`}
        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-fg/5 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-fg/5 ${collapsed ? "justify-center" : ""}`}
      >
        <Avatar name={profile.fullName} size="sm" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 leading-tight md:max-lg:hidden">
              <span className="block truncate text-sm text-fg">{profile.fullName}</span>
              <span className="block truncate text-xs text-muted-foreground">{profile.company}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground md:max-lg:hidden" />
          </>
        )}
      </DropdownMenuTrigger>

      {/* Expanded: exactly as wide as the name card, so it lines up with the sidebar.
          Collapsed (icons only): opens beside the avatar instead. */}
      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align={collapsed ? "end" : "start"}
        sideOffset={collapsed ? 14 : 8}
        className={`rounded-xl p-1.5 ${collapsed ? "w-60" : "w-(--radix-dropdown-menu-trigger-width)"}`}
      >
        {/* Who you are */}
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 pb-3 pt-2 font-normal">
          <Avatar name={profile.fullName} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{profile.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </DropdownMenuLabel>
        <div className="mx-2.5 mb-2 flex items-center gap-2 rounded-lg bg-fg/[0.04] px-2.5 py-2 text-xs">
          <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-fg">{profile.company}</span>
          <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
            {profile.role}
          </span>
        </div>

        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => router.push("/settings#profile")} className={itemCls}>
            <UserRound />
            Your profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/settings#appearance")} className={itemCls}>
            <Palette />
            Appearance
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCommandOpen(true)} className={itemCls}>
            <Search />
            Search
            <Keys keys={isMac ? ["⌘", "K"] : ["Ctrl", "K"]} />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem
          // Stay open so the switch visibly flips.
          onSelect={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
          role="menuitemcheckbox"
          aria-checked={isDark}
          className={itemCls}
        >
          <Moon />
          Dark mode
          <Switch
            checked={isDark}
            tabIndex={-1}
            aria-hidden
            size="sm"
            className="pointer-events-none ml-auto"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
