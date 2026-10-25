import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomer, getCustomers, getProfile, getToday } from "@/lib/data";
import CustomerProfile from "@/components/CustomerProfile";

export async function generateStaticParams() {
  const customers = await getCustomers();
  return customers.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await getCustomer(id);
  return { title: c ? `${c.name} · ${c.company}` : "Customer not found" };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, today] = await Promise.all([getProfile(id), getToday()]);
  if (!profile) notFound();
  return <CustomerProfile c={profile} today={today} />;
}
