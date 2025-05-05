import { checkUserAccess } from "@/actions/roleActions";
import { Dashboard } from "@/components/dashboard/dashboard";
import { ErrorDisplay } from "@/components/ui/error-display";

export default async function DashboardPage() {
  const result = await checkUserAccess();
  if (!result.success) {
    return <ErrorDisplay error={result.error.message} />;
  }

  return <Dashboard />
}