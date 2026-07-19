import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CUSTOMERS, getCustomer, getProfile } from "@/lib/customers";
import CustomerProfile from "@/components/CustomerProfile";

export function generateStaticParams() {
  return CUSTOMERS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = getCustomer(id);
  return { title: c ? `${c.name} — Aurora` : "Customer — Aurora" };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = getCustomer(id);
  if (!c) notFound();
  return <CustomerProfile c={getProfile(c)} />;
}
