import { ArrowDownRight, ArrowUpRight } from "lucide-react";

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
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      title={title}
      className={`tabular inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-medium ${
        good ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
      }`}
    >
      <Arrow className="size-3" />
      {value.toFixed(1)}
      {unit}
    </span>
  );
}
