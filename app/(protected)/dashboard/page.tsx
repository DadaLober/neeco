import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {

  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get current time for greeting
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{greeting}</h2>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || 'User'}!
          </p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Session Information</h3>
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{session?.user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="text-sm">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
