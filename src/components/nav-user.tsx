"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { EllipsisVertical, LogOut, Settings, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserProfileDialog } from "@/components/user-profile-dialog";

export function NavUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const username = user?.username || "";
  const { isMobile } = useSidebar();
  const { signOut } = useClerk();
  const router = useRouter();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="px-4 py-2 text-muted-foreground text-sm">Loading...</div>
    );
  }

  if (!(isSignedIn && user)) {
    return null;
  }

  const userData = {
    name: user.fullName || user.username || user.firstName || "User",
    email: user.primaryEmailAddress?.emailAddress || "",
    avatar: user.imageUrl || "",
  };

  const handleAccountClick = () => {
    router.push(`/${username}/settings`);
  };

  const handleAccountDialog = () => {
    setAccountDialogOpen(true);
  };

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage alt={userData.name} src={userData.avatar} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userData.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {userData.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={userData.name} src={userData.avatar} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userData.name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {userData.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAccountDialog}>
                <UserCircle />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
          <UserProfileDialog
            onOpenChange={setAccountDialogOpen}
            open={accountDialogOpen}
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
