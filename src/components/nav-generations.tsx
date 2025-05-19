"use client"

import { useRef } from "react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavGenerations({
  items,
}: {
  items: {
    title: string
    url: string
    icon: React.ElementType
  }[]
}) {
  // Create an array of refs, one for each item
  const iconRefs = useRef<
    (null | { startAnimation?: () => void; stopAnimation?: () => void })[]
  >([])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>My Desk</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, idx) => (
            <SidebarMenuItem
              key={item.title}
              onMouseEnter={() => iconRefs.current[idx]?.startAnimation?.()}
              onMouseLeave={() => iconRefs.current[idx]?.stopAnimation?.()}
              className="group"
            >
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link href={item.url}>
                  {item.icon && (
                    <item.icon
                      ref={(
                        el: {
                          startAnimation?: () => void
                          stopAnimation?: () => void
                        } | null
                      ) => (iconRefs.current[idx] = el)}
                      className="text-foreground/70 h-4 w-4"
                    />
                  )}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
