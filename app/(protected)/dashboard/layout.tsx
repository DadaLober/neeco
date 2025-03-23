import { getSelf, isUserOrAdmin } from "@/actions/roleActions";
import { auth } from "@/auth";
import AccessDeniedPage from "@/components/admin/access-denied";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!(await isUserOrAdmin(session))) {
    return <AccessDeniedPage />;
  }

  const self = await getSelf(session);

  if (!self) {
    return <AccessDeniedPage />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header user={self} />
      <div className="flex flex-row flex-grow overflow-auto">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
