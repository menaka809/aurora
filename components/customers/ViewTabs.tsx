"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bookmark,
  Gem,
  Hourglass,
  Plus,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { BUILT_IN_VIEWS, filtersEqual } from "@/lib/views";
import type { CustomerFilters } from "@/lib/customers-query";
import type { SavedView } from "@/lib/table-store";

/** Icon and accent colour for each built-in view. */
const VIEW_STYLE: Record<string, { icon: LucideIcon; tone: string }> = {
  all: { icon: Users, tone: "text-muted-foreground" },
  "at-risk": { icon: AlertTriangle, tone: "text-warning" },
  trials: { icon: Hourglass, tone: "text-primary" },
  "high-value": { icon: Gem, tone: "text-success" },
  new: { icon: Sparkles, tone: "text-[#8B5BEF]" },
};

function Tab({
  active,
  icon: Icon,
  tone,
  label,
  count,
  onClick,
  className = "",
}: {
  active: boolean;
  icon: LucideIcon;
  tone: string;
  label: string;
  count?: number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
        active ? "text-fg" : "text-muted-foreground hover:bg-fg/5 hover:text-fg"
      } ${className}`}
    >
      {/* One pill slides between tabs as the active view changes. */}
      {active && (
        <motion.span
          layoutId="customer-view-active"
          transition={{ type: "spring", stiffness: 450, damping: 36 }}
          className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/25"
        />
      )}
      <Icon className={`relative size-3.5 shrink-0 ${tone}`} />
      <span className="relative whitespace-nowrap">{label}</span>
      {count !== undefined && (
        <span
          className={`tabular relative min-w-6 rounded-md px-1.5 py-px text-center text-[11px] font-medium transition-colors ${
            active ? "bg-primary text-white" : "bg-fg/5 text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function ViewTabs({
  filters,
  counts,
  savedViews,
  onSelectBuiltIn,
  onSelectSaved,
  onSave,
  onDelete,
}: {
  filters: CustomerFilters;
  counts: Record<string, number>;
  savedViews: SavedView[];
  onSelectBuiltIn: (filters: CustomerFilters) => void;
  onSelectSaved: (view: SavedView) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");

  const activeBuiltIn = BUILT_IN_VIEWS.find((v) => filtersEqual(filters, v.filters));
  const activeSaved = activeBuiltIn
    ? undefined
    : savedViews.find((v) => filtersEqual(filters, v.filters));
  const isCustom = !activeBuiltIn && !activeSaved;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <div
        role="tablist"
        aria-label="Customer views"
        className="card-shadow flex shrink-0 items-center gap-0.5 rounded-xl border border-border bg-surface p-1"
      >
        {BUILT_IN_VIEWS.map((v) => {
          const style = VIEW_STYLE[v.id] ?? VIEW_STYLE.all;
          return (
            <Tab
              key={v.id}
              active={activeBuiltIn?.id === v.id}
              icon={style.icon}
              tone={style.tone}
              label={v.label}
              count={counts[v.id] ?? 0}
              onClick={() => onSelectBuiltIn(v.filters)}
            />
          );
        })}

        {savedViews.length > 0 && <span aria-hidden className="mx-1 h-5 w-px bg-border" />}

        {savedViews.map((v) => (
          <div key={v.id} className="group/view relative shrink-0">
            <Tab
              active={activeSaved?.id === v.id}
              icon={Bookmark}
              tone="text-primary"
              label={v.name}
              onClick={() => onSelectSaved(v)}
              className="pr-7"
            />
            <button
              aria-label={`Delete view ${v.name}`}
              onClick={() => onDelete(v.id)}
              className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-fg/10 hover:text-fg focus-visible:opacity-100 group-hover/view:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>

      <Popover
        open={saveOpen}
        onOpenChange={(o) => {
          setSaveOpen(o);
          if (!o) setName("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            disabled={!isCustom}
            title={
              isCustom
                ? "Save the current filters as a view"
                : "Change the filters to save a new view"
            }
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus className="size-3.5" />
            Save view
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              onSave(name.trim());
              setSaveOpen(false);
              setName("");
            }}
            className="space-y-3"
          >
            <label htmlFor="view-name" className="block text-xs font-medium text-muted-foreground">
              View name
            </label>
            <Input
              id="view-name"
              autoFocus
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise renewals"
            />
            <p className="text-xs text-muted-foreground">
              Saves the current filters, sort and columns.
            </p>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Save view
            </button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
