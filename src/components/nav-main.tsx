"use client";

import Link from "next/link";
import { useRef } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
}) {
  // Create an array of refs, one for each item
  const iconRefs = useRef<
    (null | { startAnimation?: () => void; stopAnimation?: () => void })[]
  >([]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, idx) => (
            <SidebarMenuItem
              className="group"
              key={item.title}
              onMouseEnter={() => iconRefs.current[idx]?.startAnimation?.()}
              onMouseLeave={() => iconRefs.current[idx]?.stopAnimation?.()}
            >
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && (
                    <item.icon
                      className="h-4 w-4 text-foreground/70"
                      ref={(
                        el: {
                          startAnimation?: () => void;
                          stopAnimation?: () => void;
                        } | null
                      ) => (iconRefs.current[idx] = el)}
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
  );
}
