import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileNav from "@/components/MobileNav";
import CommandPalette from "@/components/CommandPalette";
import Toaster from "@/components/Toaster";
import { getCustomerIndex } from "@/lib/data";

// Data is anchored to "today" (UTC); re-render hourly so it rolls over soon
// after midnight.
export const revalidate = 3600;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customers = await getCustomerIndex();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-5 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
      <CommandPalette customers={customers} />
      <Toaster />
    </div>
  );
}
