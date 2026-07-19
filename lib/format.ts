export function formatCurrency(n: number, compact = false): string {
  if (compact && n >= 1000) {
    const k = n / 1000;
    return `$${n >= 10000 ? Math.round(k) : k.toFixed(1)}k`;
  }
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatNumber(n: number, compact = false): string {
  if (compact && n >= 1000) {
    const k = n / 1000;
    return `${n >= 10000 ? Math.round(k) : k.toFixed(1)}k`;
  }
  return Math.round(n).toLocaleString("en-US");
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatValue(
  value: number,
  format: "currency" | "number" | "percent"
): string {
  if (format === "currency") return formatCurrency(value);
  if (format === "percent") return formatPercent(value);
  return formatNumber(value);
}
