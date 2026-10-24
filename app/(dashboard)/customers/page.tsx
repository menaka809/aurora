import CustomersTable from "@/components/CustomersTable";
import { getCustomers, getToday } from "@/lib/data";

export default async function CustomersPage() {
  const [customers, today] = await Promise.all([getCustomers(), getToday()]);
  return <CustomersTable customers={customers} today={today} />;
}
