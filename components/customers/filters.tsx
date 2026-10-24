"use client";

import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Clock,
  DollarSign,
  FilterX,
  HeartPulse,
  Layers,
  ListFilter,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { HEALTH_LABEL, PLANS, STATUS_LABEL } from "@/lib/customers";
import {
  HEALTHS,
  JOINED,
  JOINED_LABEL,
  LAST_SEEN,
  LAST_SEEN_LABEL,
  STATUSES,
  type CustomerFilters,
  type Facets,
} from "@/lib/customers-query";
import { formatCurrency, formatNumber } from "@/lib/format";

export type SetFilters = (patch: Partial<CustomerFilters>) => void;

type Option = { value: string; label: string; count?: number };

type MultiField = {
  id: "plan" | "status" | "health";
  label: string;
  icon: LucideIcon;
  kind: "multi";
  values: readonly string[];
  labels: Record<string, string>;
  count: (facets: Facets, value: string) => number;
};
type RangeField = {
  id: "mrr" | "seats";
  label: string;
  icon: LucideIcon;
  kind: "range";
  min: "mrrMin" | "seatsMin";
  max: "mrrMax" | "seatsMax";
  bounds: (facets: Facets) => [number, number];
  step: number;
  format: (n: number) => string;
};
type SingleField = {
  id: "lastSeen" | "joined";
  label: string;
  icon: LucideIcon;
  kind: "single";
  options: Option[];
};
type Field = MultiField | RangeField | SingleField;

const FIELDS: Field[] = [
  {
    id: "plan",
    label: "Plan",
    icon: Layers,
    kind: "multi",
    values: PLANS,
    labels: Object.fromEntries(PLANS.map((p) => [p, p])),
    count: (f, v) => f.plan[v as keyof Facets["plan"]],
  },
  {
    id: "status",
    label: "Status",
    icon: CircleDot,
    kind: "multi",
    values: STATUSES,
    labels: STATUS_LABEL,
    count: (f, v) => f.status[v as keyof Facets["status"]],
  },
  {
    id: "health",
    label: "Health",
    icon: HeartPulse,
    kind: "multi",
    values: HEALTHS,
    labels: HEALTH_LABEL,
    count: (f, v) => f.health[v as keyof Facets["health"]],
  },
  {
    id: "mrr",
    label: "MRR",
    icon: DollarSign,
    kind: "range",
    min: "mrrMin",
    max: "mrrMax",
    bounds: (f) => f.mrr,
    step: 50,
    format: (n) => formatCurrency(n, true),
  },
  {
    id: "seats",
    label: "Seats",
    icon: Users,
    kind: "range",
    min: "seatsMin",
    max: "seatsMax",
    bounds: (f) => f.seats,
    step: 1,
    format: (n) => formatNumber(n),
  },
  {
    id: "lastSeen",
    label: "Last seen",
    icon: Clock,
    kind: "single",
    options: LAST_SEEN.map((v) => ({ value: v, label: LAST_SEEN_LABEL[v] })),
  },
  {
    id: "joined",
    label: "Joined",
    icon: CalendarDays,
    kind: "single",
    options: JOINED.map((v) => ({ value: v, label: JOINED_LABEL[v] })),
  },
];

function isActive(field: Field, f: CustomerFilters): boolean {
  if (field.kind === "multi") return f[field.id].length > 0;
  if (field.kind === "range") return f[field.min] !== null || f[field.max] !== null;
  return f[field.id] !== null;
}

function clearPatch(field: Field): Partial<CustomerFilters> {
  if (field.kind === "multi") return { [field.id]: [] };
  if (field.kind === "range") return { [field.min]: null, [field.max]: null };
  return { [field.id]: null };
}

/** Chip text: up to two values, with the rest counted in a "+n" badge. */
function chipValue(field: Field, f: CustomerFilters): { text: string; extra: number } {
  if (field.kind !== "multi") return { text: summary(field, f), extra: 0 };
  const labels = (f[field.id] as string[]).map((v) => field.labels[v] ?? v);
  return { text: labels.slice(0, 2).join(", "), extra: Math.max(0, labels.length - 2) };
}

function summary(field: Field, f: CustomerFilters): string {
  if (field.kind === "multi") {
    const labels = (f[field.id] as string[]).map((v) => field.labels[v] ?? v);
    return labels.length > 2 ? `${labels.slice(0, 2).join(", ")} +${labels.length - 2}` : labels.join(", ");
  }
  if (field.kind === "range") {
    const lo = f[field.min];
    const hi = f[field.max];
    if (lo !== null && hi !== null) return `${field.format(lo)}–${field.format(hi)}`;
    return lo !== null ? `≥ ${field.format(lo)}` : `≤ ${field.format(hi!)}`;
  }
  return field.options.find((o) => o.value === f[field.id])?.label ?? "";
}

// ---- Editors -------------------------------------------------------------

function MultiEditor({
  field,
  filters,
  facets,
  setFilters,
}: {
  field: MultiField;
  filters: CustomerFilters;
  facets: Facets;
  setFilters: SetFilters;
}) {
  const selected = filters[field.id] as string[];
  const toggle = (value: string) => {
    const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
    setFilters({ [field.id]: next } as Partial<CustomerFilters>);
  };
  return (
    <div className="space-y-0.5">
      {field.values.map((value) => {
        const o = { value, label: field.labels[value], count: field.count(facets, value) };
        const id = `f-${field.id}-${o.value}`;
        const checked = selected.includes(o.value);
        return (
          <label
            key={o.value}
            htmlFor={id}
            className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
              checked ? "bg-primary/10" : "hover:bg-fg/5"
            }`}
          >
            <Checkbox id={id} checked={checked} onCheckedChange={() => toggle(o.value)} />
            <span className="flex-1 text-fg">{o.label}</span>
            <span className="tabular text-xs text-muted-foreground">{o.count}</span>
          </label>
        );
      })}
    </div>
  );
}

function RangeEditor({
  field,
  filters,
  facets,
  setFilters,
}: {
  field: RangeField;
  filters: CustomerFilters;
  facets: Facets;
  setFilters: SetFilters;
}) {
  const [lo, hi] = field.bounds(facets);
  const [value, setValue] = useState<[number, number]>([
    filters[field.min] ?? lo,
    filters[field.max] ?? hi,
  ]);

  const apply = ([a, b]: [number, number]) => {
    const min = Math.max(lo, Math.min(a, b));
    const max = Math.min(hi, Math.max(a, b));
    setValue([min, max]);
    setFilters({
      [field.min]: min <= lo ? null : min,
      [field.max]: max >= hi ? null : max,
    } as Partial<CustomerFilters>);
  };

  return (
    <div className="space-y-4 px-1 pb-1 pt-2">
      <Slider
        min={lo}
        max={hi}
        step={field.step}
        value={value}
        onValueChange={(v) => setValue([v[0], v[1]])}
        onValueCommit={(v) => apply([v[0], v[1]])}
        aria-label={`${field.label} range`}
      />
      <div className="flex items-center gap-2">
        <RangeInput
          label={`Minimum ${field.label}`}
          value={value[0]}
          onCommit={(n) => apply([n, value[1]])}
        />
        <span className="text-muted-foreground">–</span>
        <RangeInput
          label={`Maximum ${field.label}`}
          value={value[1]}
          onCommit={(n) => apply([value[0], n])}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Range {field.format(lo)} – {field.format(hi)}
      </p>
    </div>
  );
}

function RangeInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
}) {
  // Keyed by value so it resets when the slider moves.
  return (
    <Input
      key={value}
      type="number"
      inputMode="numeric"
      aria-label={label}
      defaultValue={value}
      className="tabular h-8"
      onBlur={(e) => {
        const n = Number(e.currentTarget.value);
        if (Number.isFinite(n) && n !== value) onCommit(n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

function SingleEditor({
  field,
  filters,
  setFilters,
}: {
  field: SingleField;
  filters: CustomerFilters;
  setFilters: SetFilters;
}) {
  const current = filters[field.id];
  return (
    <div role="radiogroup" aria-label={field.label} className="space-y-0.5">
      {[{ value: "", label: "Any time" }, ...field.options].map((o) => {
        const active = (current ?? "") === o.value;
        return (
          <button
            key={o.value || "any"}
            role="radio"
            aria-checked={active}
            onClick={() =>
              setFilters({ [field.id]: o.value || null } as Partial<CustomerFilters>)
            }
            className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-fg transition-colors ${
              active ? "bg-primary/10" : "hover:bg-fg/5"
            }`}
          >
            <Check className={`size-4 shrink-0 text-primary ${active ? "" : "invisible"}`} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Editor(props: {
  field: Field;
  filters: CustomerFilters;
  facets: Facets;
  setFilters: SetFilters;
}) {
  const { field } = props;
  if (field.kind === "multi") return <MultiEditor {...props} field={field} />;
  if (field.kind === "range")
    return (
      <RangeEditor
        // Remount when the URL value changes, so local slider state follows it.
        key={`${props.filters[field.min]}-${props.filters[field.max]}`}
        {...props}
        field={field}
      />
    );
  return <SingleEditor {...props} field={field} />;
}

// ---- "+ Filter" menu -----------------------------------------------------

export function FilterMenu({
  filters,
  facets,
  setFilters,
}: {
  filters: CustomerFilters;
  facets: Facets;
  setFilters: SetFilters;
}) {
  // A list of fields; hovering (or focusing/tapping) one opens its options in a
  // flyout beside the list. The flyout is a nested popover rather than a menu
  // submenu, because menus capture typing and would break the MRR/Seats inputs.
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Field["id"] | null>(null);

  const focusFlyout = (id: Field["id"]) => {
    setHovered(id);
    // Wait for the flyout to mount, then move focus into its first control.
    requestAnimationFrame(() =>
      document
        .getElementById(`filter-flyout-${id}`)
        ?.querySelector<HTMLElement>("button, input, [role='checkbox'], [role='slider']")
        ?.focus()
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setHovered(null);
      }}
    >
      <PopoverTrigger asChild>
        <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-fg transition-colors hover:bg-elevated data-[state=open]:bg-elevated">
          <ListFilter className="size-4 text-muted-foreground" />
          Filter
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 gap-0 p-1.5 outline-none"
        tabIndex={-1}
        // Focus the list itself, not its first item, so no flyout opens until
        // the user hovers, clicks or tabs to a field.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Filter by
        </p>
        {FIELDS.map((f) => {
          const current = hovered === f.id;
          return (
            <Popover
              key={f.id}
              open={current}
              onOpenChange={(o) => {
                if (!o) setHovered((h) => (h === f.id ? null : h));
              }}
            >
              <PopoverAnchor asChild>
                <button
                  aria-haspopup="dialog"
                  aria-expanded={current}
                  onMouseEnter={() => setHovered(f.id)}
                  onFocus={() => setHovered(f.id)}
                  onClick={() => setHovered(f.id)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "Enter") {
                      e.preventDefault();
                      focusFlyout(f.id);
                    }
                  }}
                  // The field whose flyout is open stays highlighted.
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    current ? "bg-primary/10 text-primary" : "text-fg hover:bg-fg/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {f.label}
                    {isActive(f, filters) && <span className="size-1.5 rounded-full bg-primary" />}
                  </span>
                  <ChevronRight
                    className={`size-3.5 ${current ? "text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              </PopoverAnchor>
              <PopoverContent
                id={`filter-flyout-${f.id}`}
                side="right"
                align="start"
                sideOffset={10}
                alignOffset={-6}
                className="w-64 gap-0 p-1.5"
                // Opening on hover shouldn't pull keyboard focus out of the list.
                onOpenAutoFocus={(e) => e.preventDefault()}
                onEscapeKeyDown={() => setHovered(null)}
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </p>
                  {isActive(f, filters) && (
                    <button
                      onClick={() => setFilters(clearPatch(f))}
                      className="text-[11px] text-muted-foreground transition-colors hover:text-fg"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Editor field={f} filters={filters} facets={facets} setFilters={setFilters} />
              </PopoverContent>
            </Popover>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ---- Active filter chips -------------------------------------------------

export function FilterChips({
  filters,
  facets,
  setFilters,
  onClearAll,
  trailing,
}: {
  filters: CustomerFilters;
  facets: Facets;
  setFilters: SetFilters;
  onClearAll: () => void;
  trailing?: ReactNode;
}) {
  const active = FIELDS.filter((f) => isActive(f, filters));
  if (active.length === 0 && !filters.q)
    return trailing ? <div className="flex flex-wrap items-center gap-2">{trailing}</div> : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((field) => {
        const { text, extra } = chipValue(field, filters);
        const Icon = field.icon;
        return (
          // Styled like the toolbar controls: surface, border, soft shadow.
          <div
            key={field.id}
            className="card-shadow flex h-8 items-center overflow-hidden rounded-lg border border-border bg-surface text-xs text-fg has-[[data-state=open]]:border-primary/50 has-[[data-state=open]]:ring-2 has-[[data-state=open]]:ring-primary/15"
          >
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label={`Edit ${field.label} filter: ${summary(field, filters)}`}
                  className="flex h-full items-center gap-2 pl-2.5 pr-2 transition-colors hover:bg-fg/5"
                >
                  <Icon className="size-3.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="h-3.5 w-px bg-border" />
                  <span className="max-w-48 truncate font-medium">{text}</span>
                  {extra > 0 && (
                    <span className="tabular rounded bg-primary/10 px-1 py-px text-[10px] font-medium text-primary">
                      +{extra}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 gap-0 p-1.5">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </p>
                </div>
                <Editor field={field} filters={filters} facets={facets} setFilters={setFilters} />
              </PopoverContent>
            </Popover>
            <button
              aria-label={`Remove ${field.label} filter`}
              onClick={() => setFilters(clearPatch(field))}
              className="flex h-full items-center border-l border-border px-2 text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
      <button
        onClick={onClearAll}
        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg"
      >
        <FilterX className="size-3.5" />
        Clear all
      </button>
      {trailing}
    </div>
  );
}
