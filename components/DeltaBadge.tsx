import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/** "+3.2%" pill coloured by whether the change is good, with an explanatory tooltip. */
export default function DeltaBadge({
  value,
  up,
  good,
  unit = "%",
  title,
}: {
  /** Absolute size of the change. */
  value: number;
  up: boolean;
  good: boolean;
  unit?: "%" | " pts";
  title?: string;
}) {
  // Rounds to 0.0: no arrow, no good/bad colour.
  const flat = value < 0.05;
  const Arrow = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      title={title}
      className={`tabular inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-medium ${
        flat
          ? "bg-fg/5 text-muted-foreground"
          : good
            ? "bg-success/10 text-success"
            : "bg-danger/10 text-danger"
      }`}
    >
      <Arrow className="size-3" />
      {value.toFixed(1)}
      {unit}
    </span>
  );
}
