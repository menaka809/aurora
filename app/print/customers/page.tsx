import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import PrintActions from "@/components/customers/PrintActions";
import { getCustomerRowsForExport, getToday } from "@/lib/data";
import {
  describeFilters,
  loadCustomerQuery,
  type CustomerRow,
} from "@/lib/customers-query";
import { COLUMN_LABELS, DATA_COLUMNS } from "@/lib/customer-columns";
import { HEALTH_LABEL, STATUS_LABEL, avatarColor, initials, type Status } from "@/lib/customers";
import { formatCurrency, formatDate, formatDaysAgo, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Customer report — Aurora",
  robots: { index: false },
};

/** Columns shown when the table hasn't told us which are visible. */
const DEFAULT_PRINT = ["name", "plan", "mrr", "status", "lastSeen", "seats", "joined"];
const NUMERIC = new Set(["mrr", "seats", "ltv"]);

const STATUS_DOT: Record<Status, string> = {
  active: "bg-success",
  trial: "bg-primary",
  past_due: "bg-warning",
  churned: "bg-muted-foreground",
};

const CELL: Record<string, (r: CustomerRow) => ReactNode> = {
  name: (r) => (
    <div className="flex items-center gap-2.5">
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
        style={{ background: avatarColor(r.name) }}
      >
        {initials(r.name)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-fg">{r.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {r.company} · {r.email}
        </p>
      </div>
    </div>
  ),
  plan: (r) => r.plan,
  mrr: (r) => (r.mrr ? formatCurrency(r.mrr) : "—"),
  status: (r) => (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
      {STATUS_LABEL[r.status]}
    </span>
  ),
  lastSeen: (r) => formatDaysAgo(r.lastLoginDays),
  seats: (r) => formatNumber(r.seats),
  joined: (r) => formatDate(r.joined),
  ltv: (r) => formatCurrency(r.ltv),
  manager: (r) => r.manager,
  // The live table's custom tags are browser-only, so the report shows health tags.
  tags: (r) => r.health.map((h) => HEALTH_LABEL[h]).join(", ") || "—",
};

export default async function CustomerReport({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = loadCustomerQuery(params);
  const requested = typeof params.cols === "string" ? params.cols.split(",") : [];
  const cols = requested.filter((c) => DATA_COLUMNS.includes(c));
  const columns = cols.includes("name") ? cols : ["name", ...(cols.length ? cols : DEFAULT_PRINT.slice(1))];

  const [rows, today] = await Promise.all([getCustomerRowsForExport(query, null), getToday()]);
  const totalMrr = rows.reduce((s, r) => s + r.mrr, 0);
  const paying = rows.filter((r) => r.mrr > 0).length;
  const filters = describeFilters(query);
  const sortLabel = `${COLUMN_LABELS[query.sort] ?? query.sort} (${
    query.dir === "asc" ? "ascending" : "descending"
  })`;

  return (
    // `.light` swaps in the light palette for the report, on screen and on paper.
    <div className="light min-h-dvh bg-bg text-fg">
      <PrintActions />
      <main className="mx-auto max-w-5xl px-8 py-10 print:max-w-none print:px-0 print:py-0">
        <header>
          {/* Brand line */}
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              Aurora
            </div>
            <p className="text-xs text-muted-foreground">
              Generated {formatDate(today)} · Demo workspace
            </p>
          </div>

          {/* Title */}
          <div className="mt-7">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
              Customer report
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {filters.length ? filters.join(" · ") : "All customers"}
              <span className="mx-2 text-border">|</span>
              Sorted by {sortLabel}
            </p>
          </div>

          {/* Summary figures */}
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Customers", formatNumber(rows.length)],
              ["Total MRR", formatCurrency(totalMrr)],
              ["Avg. MRR per paying account", paying ? formatCurrency(totalMrr / paying) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border px-4 py-3">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="tabular mt-1 text-xl font-semibold text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <table className="mt-8 w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-border bg-fg/3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              {columns.map((c) => (
                <th
                  key={c}
                  className={`px-2.5 py-2.5 font-medium ${NUMERIC.has(c) ? "text-right" : ""}`}
                >
                  {COLUMN_LABELS[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/70">
                {columns.map((c) => (
                  <td
                    key={c}
                    className={`px-2.5 py-2.5 align-middle ${
                      NUMERIC.has(c) ? "tabular text-right" : ""
                    } ${c === "name" ? "max-w-64" : "whitespace-nowrap text-muted-foreground"}`}
                  >
                    {CELL[c](r)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-2 py-10 text-center text-muted-foreground">
                  No customers match these filters.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="text-[13px] font-medium">
                {columns.map((c, i) => (
                  <td key={c} className={`px-2.5 py-3 ${NUMERIC.has(c) ? "tabular text-right" : ""}`}>
                    {i === 0 ? `Total · ${formatNumber(rows.length)} customers` : c === "mrr" ? formatCurrency(totalMrr) : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>

        <footer className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
          Generated by Aurora on {formatDate(today)}. Demo workspace with sample data.
        </footer>
      </main>
    </div>
  );
}
