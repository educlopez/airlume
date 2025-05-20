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

import { HomeIcon } from "../icons/home"
import type { HomeIconHandle } from "../icons/home"
import Logo from "../logo"

export default function NavBar() {
  const { user, isLoaded, isSignedIn } = useUser()
  const username = user?.username || "dashboard"

  const router = useRouter()

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

  const iconRef = useRef<HomeIconHandle | null>(null)

  return (
    <header className="shadow-custom bg-background text-foreground fixed top-5 left-1/2 z-50 inline-flex min-w-4xl -translate-x-1/2 rounded-full">
      <div className="flex w-full items-center justify-between gap-10 px-8 py-4">
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
  )
}
