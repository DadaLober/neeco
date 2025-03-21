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
    <div className="flex flex-col">
      <Header user={self} />
      <div className="flex flex-row">
        <Sidebar />
        <main className="flex-grow overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
