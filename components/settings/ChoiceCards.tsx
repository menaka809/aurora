"use client";

import type { ReactNode } from "react";
import { RadioGroup } from "radix-ui";
import { Check } from "lucide-react";

export type Choice<T extends string> = {
  value: T;
  label: string;
  description: string;
  preview: ReactNode;
};

/** A radio group drawn as cards with a preview — arrow keys move between them. */
export default function ChoiceCards<T extends string>({
  label,
  value,
  onChange,
  choices,
  columns = 3,
}: {
  /** Accessible name of the group. */
  label: string;
  /** Empty until the saved value has loaded, so nothing looks selected. */
  value: T | "";
  onChange: (value: T) => void;
  choices: Choice<T>[];
  columns?: 2 | 3;
}) {
  return (
    <RadioGroup.Root
      aria-label={label}
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className={`grid gap-3 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      {choices.map((c) => (
        <RadioGroup.Item
          key={c.value}
          value={c.value}
          className="group relative rounded-xl border border-border bg-bg p-2 text-left outline-none transition-colors hover:border-fg/20 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=checked]:border-primary data-[state=checked]:ring-1 data-[state=checked]:ring-primary"
        >
          <div aria-hidden className="overflow-hidden rounded-lg border border-border">
            {c.preview}
          </div>
          <div className="flex items-start justify-between gap-2 px-1 pb-0.5 pt-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-fg">{c.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
            </div>
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-fg/25 transition-colors group-data-[state=checked]:border-primary-solid group-data-[state=checked]:bg-primary-solid">
              <RadioGroup.Indicator>
                <Check className="size-2.5 text-white" strokeWidth={3} />
              </RadioGroup.Indicator>
            </span>
          </div>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
