import { checkUserAccess } from "@/actions/roleActions";

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/dashboard/breadcrumbs";
import { ErrorDisplay } from "@/components/ui/error-display";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const result = await checkUserAccess();
  if (!result.success) {
    return <ErrorDisplay error={result.error.message} />;
  }

  const self = {
    name: result.data.user.name ?? "User",
    email: result.data.user.email ?? "user@example.com",
    avatar: result.data.user.image ?? "/avatars/default.png"
  }

  return (
    <SidebarProvider>
      <AppSidebar user={self} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min" >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

