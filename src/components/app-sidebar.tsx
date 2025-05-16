"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { Image, LayoutDashboard, NotebookPen, Pencil } from "lucide-react"

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
      title: "Create Post",
      url: `/${username}/generator`,
      icon: NotebookPen,
    },
  ]
  const navDocuments = [
    {
      title: "Posts",
      url: `/${username}/posts`,
      icon: Pencil,
    },
    {
      title: "Media Library",
      url: `/${username}/media-library`,
      icon: Image,
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
        <NavDocuments items={navDocuments} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <Separator className="my-2" />
        <Copyright />
      </SidebarFooter>
    </Sidebar>
  )
}
