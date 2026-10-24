import type { Metadata } from "next";
import CustomersView from "@/components/customers/CustomersView";
import {
  MANAGERS,
  getCustomerIndex,
  getCustomerPage,
  getProfile,
  getToday,
  getViewCounts,
} from "@/lib/data";
import { loadCustomerQuery } from "@/lib/customers-query";

export const metadata: Metadata = { title: "Customers — Aurora" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadCustomerQuery(await searchParams);
  const [page, viewCounts, today, directory, preview] = await Promise.all([
    getCustomerPage(query),
    getViewCounts(),
    getToday(),
    getCustomerIndex(),
    query.preview ? getProfile(query.preview) : Promise.resolve(undefined),
  ]);

  return (
    <CustomersView
      page={page}
      viewCounts={viewCounts}
      today={today}
      managers={MANAGERS}
      directory={directory}
      preview={preview ?? null}
    />
  );
}
