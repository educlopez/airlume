"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useClerk,
  useUser,
} from "@clerk/nextjs"
import { LayoutDashboard, LogOut, Settings, UserCircle } from "lucide-react"

import { ThemeSwitcher } from "@/components/theme-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserProfileDialog } from "@/components/user-profile-dialog"

import Logo from "../logo"

export default function NavBar() {
  const { user, isLoaded, isSignedIn } = useUser()
  const username = user?.username || "dashboard"
  const { signOut } = useClerk()
  const router = useRouter()
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="text-muted-foreground px-4 py-2 text-sm">Loading...</div>
    )
  }

  const userData = {
    name: user?.fullName || user?.username || user?.firstName || "User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    avatar: user?.imageUrl || "",
  }
  const handleDashboardClick = () => {
    router.push(`/${username}`)
  }
  const handleAccountClick = () => {
    router.push(`/${username}/settings`)
  }

  const handleAccountDialog = () => {
    setAccountDialogOpen(true)
  }

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" })
  }

  return (
    <header className="shadow-custom bg-background text-foreground fixed top-5 left-1/2 z-50 inline-flex -translate-x-1/2 rounded-full">
      <div className="flex items-center justify-between gap-10 px-8 py-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-auto" />
        </div>
        <nav className="text-foreground/70 hidden items-center justify-center gap-10 text-base font-medium md:flex">
          <Link
            href="#features"
            className="hover:text-foreground flex min-w-fit items-center justify-center transition"
          >
            Features
          </Link>
          <Link
            href="#services"
            className="hover:text-foreground flex min-w-fit items-center justify-center transition"
          >
            Services
          </Link>
          <Link
            href="#about"
            className="hover:text-foreground flex min-w-fit items-center justify-center transition"
          >
            About Us
          </Link>
          <Link
            href="#faq"
            className="hover:text-foreground flex min-w-fit items-center justify-center transition"
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton>
              <Button variant="custom">Sign in</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline">Sign up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            {isLoaded && isSignedIn && user ? (
              <>
                <Button onClick={handleDashboardClick} variant="custom">
                  <LayoutDashboard />
                  Dashboard
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="size-9 rounded-md">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName || user?.username || "User"}
                      />
                      <AvatarFallback>
                        {user?.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={userData.avatar}
                            alt={userData.name}
                          />
                          <AvatarFallback className="rounded-lg">
                            CN
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {userData.name}
                          </span>
                          <span className="text-foreground/70 truncate text-xs">
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
                    open={accountDialogOpen}
                    onOpenChange={setAccountDialogOpen}
                  />
                </DropdownMenu>
              </>
            ) : (
              <div className="bg-primary/10 h-8 w-8 animate-pulse rounded-full" />
            )}
          </SignedIn>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
