'use client';

// React core imports
import { useState, useEffect } from "react";

// Next.js imports
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icons
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FolderOpen,
  Mail,
  ChevronLeft,
  Menu,
  LogOut,
  HelpCircle,
} from "lucide-react";

// UI Component imports
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

// Utility imports
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FolderOpen,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: Mail,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarContentProps {
  className?: string;
  collapsed?: boolean;
}

function SidebarContent({ className, collapsed }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className={cn("relative min-h-full", className)}>
      <div className="px-3 py-2">
        <div className="mt-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm transition-all",
                collapsed ? "justify-center" : "justify-start",
                pathname === link.href ?
                  "bg-[#008033] text-white dark:bg-[#008033] dark:text-white cursor-default" :
                  "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <link.icon className={cn(
                "h-4 w-4",
                collapsed ? "mr-0" : "mr-2"
              )} />
              {!collapsed && <span>{link.title}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-3 space-y-2 border-t bg-background dark:bg-[#006629] dark:border-[#008033]",
        collapsed ? "flex flex-col items-center" : ""
      )}>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-500/20"
          onClick={() => window.open('/help', '_blank')}
        >
          <HelpCircle className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
          {!collapsed && "Help"}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed left-4 top-3 z-50 h-8 w-8"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 dark:bg-[#006629] border-none">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-left dark:text-white">Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "relative hidden lg:block h-full border-r transition-all duration-300 dark:border-none dark:bg-[#006629]",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 h-8 w-8 rounded-full border bg-background dark:bg-[#006629] dark:border-[#008033]"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronLeft className={cn(
          "h-6 w-6 transition-all text-muted-foreground dark:text-white/70",
          collapsed ? "rotate-180" : "rotate-0"
        )} />
      </Button>

      <SidebarContent collapsed={collapsed} />
    </div>
  );
}
