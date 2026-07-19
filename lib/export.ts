import { STATUS_LABEL, type Customer } from "./customers";

const HEADERS = ["Name", "Email", "Plan", "MRR", "Status", "Joined", "Seats"];

function rowValues(c: Customer): (string | number)[] {
  return [c.name, c.email, c.plan, c.mrr, STATUS_LABEL[c.status], c.joined, c.seats];
}

function esc(v: string | number, delim: string): string {
  const s = String(v);
  return new RegExp(`["${delim}\\n]`).test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toDelimited(customers: Customer[], delim: string): string {
  const rows = [HEADERS, ...customers.map(rowValues)];
  return rows.map((r) => r.map((v) => esc(v, delim)).join(delim)).join("\n");
}

export function downloadCSV(customers: Customer[], filename = "customers.csv") {
  const csv = toDelimited(customers, ",");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyRows(customers: Customer[]): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(toDelimited(customers, "\t"));
    return true;
  } catch {
    return false;
  }
}
