import { getSelf, isUserOrAdmin } from "@/actions/roleActions";
import { auth } from "@/auth";

import AccessDeniedPage from "@/components/admin/access-denied";
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/dashboard/breadcrumbs";

export default async function Layout({ children }: { children: React.ReactNode }) {

  const session = await auth();
  if (!await isUserOrAdmin(session) && !session) {
    return <AccessDeniedPage />;
  }
  const data = await getSelf(session);

  if (!data) {
    return <AccessDeniedPage />;
  }

  const self = {
    name: data.name,
    email: data.email,
    avatar: data.image || "",
  }

  return (
    <SidebarProvider>
      <AppSidebar user={self} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 bg-muted/50">
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

