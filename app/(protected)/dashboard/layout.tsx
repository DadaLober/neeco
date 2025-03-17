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
    <div className="h-screen flex flex-col">
      <Header session={session} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
