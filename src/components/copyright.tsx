import Image from "next/image"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"

export default function Copyright() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          asChild
        >
          <a
            href="https://x.com/educalvolpz"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-foreground flex w-full flex-row items-center justify-center gap-2"
          >
            <p className="text-xs font-medium">Made by</p>
            <div className="flex h-6 w-6 shrink-0 gap-2 rounded-full">
              <Image
                src="https://github.com/educlopez.png"
                alt="User Avatar of Eduardo Calvo"
                width={28}
                height={28}
                className="shrink-0 rounded-md"
              />
            </div>
            <p className="text-xs font-bold">Eduardo Calvo</p>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
