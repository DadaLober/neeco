import { auth } from "@/auth";
import { Header } from "../../../components/dashboard/Header";
import { Sidebar } from "../../../components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header session={session} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
