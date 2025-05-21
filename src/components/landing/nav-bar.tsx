"use client"

import { useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs"

import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { HomeIcon } from "../icons/home"
import type { HomeIconHandle } from "../icons/home"
import Logo from "../logo"

export default function NavBar() {
  const { user, isLoaded, isSignedIn } = useUser()
  const username = user?.username || "dashboard"

  const router = useRouter()
  const iconRef = useRef<HomeIconHandle | null>(null)

  if (!isLoaded) {
    return (
      <div className="text-muted-foreground absolute px-4 py-2 text-sm">
        Loading...
      </div>
    )
  }

  const handleDashboardClick = () => {
    router.push(`/${username}`)
  }

  return (
    <>
      {/* Desktop NavBar */}
      <header className="shadow-custom bg-background text-foreground fixed top-5 left-1/2 z-50 hidden min-w-4xl -translate-x-1/2 rounded-full md:block">
        <div className="flex w-full items-center justify-between gap-10 px-8 py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
          </div>
          <nav className="text-foreground/70 hidden items-center justify-center gap-10 text-base font-medium md:flex">
            <Link
              href="#about"
              className="hover:text-foreground flex min-w-fit items-center justify-center transition"
            >
              About Us
            </Link>
            <Link
              href="#features"
              className="hover:text-foreground flex min-w-fit items-center justify-center transition"
            >
              Features
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
                  <Button
                    onClick={handleDashboardClick}
                    variant="custom"
                    onMouseEnter={() => iconRef.current?.startAnimation?.()}
                    onMouseLeave={() => iconRef.current?.stopAnimation?.()}
                  >
                    <HomeIcon ref={iconRef} />
                    Dashboard
                  </Button>
                </>
              ) : (
                <div className="bg-primary/10 h-8 w-8 animate-pulse rounded-full" />
              )}
            </SignedIn>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile NavBar */}
      <header className="shadow-custom bg-background text-foreground fixed top-5 left-1/2 z-50 flex w-[95vw] max-w-2xl -translate-x-1/2 rounded-full md:hidden">
        <div className="flex w-full items-center justify-between px-4 py-3">
          {/* Logo left */}
          <Logo className="h-8 w-auto" />
          {/* Right: ThemeSwitcher + Dropdown */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="hover:bg-accent focus:ring-ring rounded-full p-2 focus:ring-2 focus:outline-none"
                >
                  {/* Hamburger icon (SVG) */}
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="block"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="#features">Features</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#services">Services</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#about">About Us</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#faq">FAQ</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignedOut>
                  <DropdownMenuItem asChild>
                    <SignInButton mode="modal">
                      <span>Sign in</span>
                    </SignInButton>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <SignUpButton mode="modal">
                      <span>Sign up</span>
                    </SignUpButton>
                  </DropdownMenuItem>
                </SignedOut>
                <SignedIn>
                  {isLoaded && isSignedIn && user ? (
                    <DropdownMenuItem onClick={handleDashboardClick}>
                      <HomeIcon className="mr-2" /> Dashboard
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem disabled>
                      <div className="bg-primary/10 h-6 w-6 animate-pulse rounded-full" />
                    </DropdownMenuItem>
                  )}
                </SignedIn>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  )
}
