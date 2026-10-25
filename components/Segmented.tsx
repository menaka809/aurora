"use client";

import { motion } from "framer-motion";
import { ToggleGroup } from "radix-ui";

/**
 * Segmented control on Radix ToggleGroup: one tab stop, arrow keys move
 * between options, and the selection is announced. A pill slides to the
 * active option.
 */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  idBase,
  label,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  /** Unique per control, so its sliding pill doesn't jump to another one. */
  idBase: string;
  /** Accessible name, e.g. "Reporting period". */
  label: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix sends "" when the active item is clicked again; keep a selection.
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      className="flex gap-1 rounded-lg border border-border bg-surface p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <ToggleGroup.Item
            key={o.value}
            value={o.value}
            className="relative rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {active && (
              <motion.span
                layoutId={idBase}
                transition={{ type: "spring", stiffness: 450, damping: 34 }}
                className="absolute inset-0 rounded-md border border-border bg-elevated"
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                active ? "text-fg" : "text-muted-foreground hover:text-fg"
              }`}
            >
              {o.label}
            </span>
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
}
