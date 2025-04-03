"use client"

import type * as React from "react"
import { BookOpen, HelpCircle, SquareTerminal, Users } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Documents",
      url: "/dashboard/documents",
      icon: BookOpen,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Help",
      url: "#",
      icon: HelpCircle,
    },
  ]
}

interface AppSidebarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="/logo.png" alt="Neeco Logo" width={40} height={40} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Neeco 2 Area 1</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

