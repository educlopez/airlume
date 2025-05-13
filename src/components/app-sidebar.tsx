"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { Database, LayoutDashboard, NotebookPen } from "lucide-react"

import Copyright from "@/components/copyright"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Separator } from "./ui/separator"

const data = {
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const username = user?.username || ""

  const navMain = [
    {
      title: "Dashboard",
      url: `/${username}`,
      icon: LayoutDashboard,
    },
    {
      title: "Generator",
      url: `/${username}/generator`,
      icon: NotebookPen,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={`/${username}`}>
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <Separator className="my-2" />
        <Copyright />
      </SidebarFooter>
    </Sidebar>
  )
}
