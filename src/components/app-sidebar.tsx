"use client"

import * as React from "react"
import Link from "next/link"
import dashboardIcon from "@/assets/images/dashboard.png"
import generateIcon from "@/assets/images/generate.png"
import mediaIcon from "@/assets/images/media.png"
import postIcon from "@/assets/images/post.png"
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

import Logo from "./logo"
import { Separator } from "./ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const username = user?.username || ""

  const navMain = [
    {
      title: "Dashboard",
      url: `/${username}`,
      icon: LayoutDashboard,
      image: dashboardIcon.src,
    },
    {
      title: "Create Post",
      url: `/${username}/generator`,
      icon: NotebookPen,
      image: generateIcon.src,
    },
  ]
  const navDocuments = [
    {
      title: "Posts",
      url: `/${username}/posts`,
      icon: Pencil,
      image: postIcon.src,
    },
    {
      title: "Media Library",
      url: `/${username}/media-library`,
      icon: Image,
      image: mediaIcon.src,
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
              <Link
                href={`/${username}`}
                className="flex w-full items-start justify-start"
              >
                <Logo className="!size-full max-h-24" />
              </Link>
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
