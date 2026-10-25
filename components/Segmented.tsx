"use client";

import { motion } from "framer-motion";

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  idBase,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  idBase: string;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          >
            {active && (
              <motion.span
                layoutId={idBase}
                transition={{ type: "spring", stiffness: 450, damping: 34 }}
                className="absolute inset-0 rounded-md border border-border bg-elevated"
              />
            )}
            <span
              className={`relative z-10 ${active ? "text-fg" : "text-muted-foreground"}`}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
