import { auth } from "@/auth";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header remains fixed */}
      <Header session={session} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main section is scrollable */}
        <main className="flex-1 h-screen overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
