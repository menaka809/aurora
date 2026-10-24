import { getCustomerPage, getCustomerRowsForExport, getToday } from "@/lib/data";
import { loadCustomerQuery } from "@/lib/customers-query";
import { toDelimited } from "@/lib/export";

// GET /api/customers/export?<table query>             → every matching row
// GET /api/customers/export?<table query>&scope=page  → just the current page
// GET /api/customers/export?ids=cus_a,cus_b           → just those rows
// Add &format=tsv for tab-separated text (pastes into Sheets/Excel as columns).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = loadCustomerQuery(url);
  const idsParam = url.searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : null;
  const pageOnly = url.searchParams.get("scope") === "page";
  const tsv = url.searchParams.get("format") === "tsv";

  const [rows, today] = await Promise.all([
    pageOnly
      ? getCustomerPage(query).then((p) => p.rows)
      : getCustomerRowsForExport(query, ids),
    getToday(),
  ]);

  return new Response(toDelimited(rows, tsv ? "\t" : ","), {
    headers: {
      "Content-Type": tsv ? "text/tab-separated-values; charset=utf-8" : "text/csv; charset=utf-8",
      ...(tsv ? {} : { "Content-Disposition": `attachment; filename="customers-${today}.csv"` }),
      "Cache-Control": "no-store",
    },
  });
}
