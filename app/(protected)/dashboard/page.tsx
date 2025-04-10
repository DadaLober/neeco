import { isUserOrAdmin } from "@/actions/roleActions";
import { auth } from "@/auth";
import { Dashboard } from "@/components/dashboard/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!await isUserOrAdmin(session) && !session) {
    redirect("/login");
  }

  return <Dashboard />
}