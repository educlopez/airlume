import Image from "next/image";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export default function Copyright() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          size="lg"
        >
          <a
            className="group flex w-full flex-row items-center justify-center gap-2 text-foreground"
            href="https://x.com/educalvolpz"
            rel="noopener noreferrer"
            target="_blank"
          >
            <p className="font-medium text-xs">Made by</p>
            <div className="flex h-6 w-6 shrink-0 gap-2 rounded-full">
              <Image
                alt="User Avatar of Eduardo Calvo"
                className="shrink-0 rounded-md"
                height={28}
                src="https://github.com/educlopez.png"
                width={28}
              />
            </div>
            <p className="font-bold text-xs">Eduardo Calvo</p>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
