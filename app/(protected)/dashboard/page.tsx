import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardTable from "@/components/dashboard/DashboardTable";

export default async function DashboardPage() {

  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || 'User'}!
          </p>
        </div>
      </div>
      <DashboardTable />
    </div>
  );
}
