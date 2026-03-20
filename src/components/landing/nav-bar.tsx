"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HomeIconHandle } from "../icons/home";
import { HomeIcon } from "../icons/home";
import Logo from "../logo";

export default function NavBar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const username = user?.username || "dashboard";

  const router = useRouter();
  const iconRef = useRef<HomeIconHandle | null>(null);

  if (!isLoaded) {
    return (
      <div className="absolute px-4 py-2 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  const handleDashboardClick = () => {
    router.push(`/${username}`);
  };

  return (
    <>
      {/* Desktop NavBar */}
      <header className="fixed top-5 left-1/2 z-50 hidden min-w-4xl -translate-x-1/2 rounded-full bg-background text-foreground shadow-custom md:block">
        <div className="flex w-full items-center justify-between gap-10 px-8 py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
          </div>
          <nav className="hidden items-center justify-center gap-10 font-medium text-base text-foreground/70 md:flex">
            <Link
              className="flex min-w-fit items-center justify-center transition hover:text-foreground"
              href="#about"
            >
              About Us
            </Link>
            <Link
              className="flex min-w-fit items-center justify-center transition hover:text-foreground"
              href="#features"
            >
              Features
            </Link>

            <Link
              className="flex min-w-fit items-center justify-center transition hover:text-foreground"
              href="#faq"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton forceRedirectUrl={"/dashboard"} mode="modal">
                <Button variant="custom">Sign in</Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl={"/dashboard"} mode="modal">
                <Button variant="outline">Sign up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {isLoaded && isSignedIn && user ? (
                <Button
                  onClick={handleDashboardClick}
                  onMouseEnter={() => iconRef.current?.startAnimation?.()}
                  onMouseLeave={() => iconRef.current?.stopAnimation?.()}
                  variant="custom"
                >
                  <HomeIcon ref={iconRef} />
                  Dashboard
                </Button>
              ) : (
                <div className="h-8 w-8 animate-pulse rounded-full bg-primary/10" />
              )}
            </SignedIn>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile NavBar */}
      <header className="fixed top-5 left-1/2 z-50 flex w-[95vw] max-w-2xl -translate-x-1/2 rounded-full bg-background text-foreground shadow-custom md:hidden">
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
                  className="rounded-full p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                  type="button"
                >
                  {/* Hamburger icon (SVG) */}
                  <svg
                    className="block"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    width="24"
                  >
                    <title>Menu</title>
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="#about">About Us</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#features">Features</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#faq">FAQ</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignedOut>
                  <DropdownMenuItem asChild>
                    <SignInButton forceRedirectUrl={"/dashboard"} mode="modal">
                      <span>Sign in</span>
                    </SignInButton>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <SignUpButton forceRedirectUrl={"/dashboard"} mode="modal">
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
                      <div className="h-6 w-6 animate-pulse rounded-full bg-primary/10" />
                    </DropdownMenuItem>
                  )}
                </SignedIn>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
