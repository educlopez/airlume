"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

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

import { CalendarDaysIcon } from "./icons/calendar-days"
import { GalleryHorizontalEndIcon } from "./icons/gallery-horizontal-end"
import { HomeIcon } from "./icons/home"
import { SquarePenIcon } from "./icons/square-pen"
import Logo from "./logo"
import { Separator } from "./ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const username = user?.username || ""

  const navMain = [
    {
      title: "Home",
      url: `/${username}`,
      icon: HomeIcon,
    },
    {
      title: "Create Post",
      url: `/${username}/generator`,
      icon: SquarePenIcon,
    },
  ]
  const navDocuments = [
    {
      title: "Post Scheduler",
      url: `/${username}/posts`,
      icon: CalendarDaysIcon,
    },
    {
      title: "Media Library",
      url: `/${username}/media-library`,
      icon: GalleryHorizontalEndIcon,
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
