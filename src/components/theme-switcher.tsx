"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { LaptopMinimalCheckIcon } from "./icons/laptop-minimal-check"
import { MoonIcon } from "./icons/moon"
import { SunIcon } from "./icons/sun"

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const ICON_SIZE = 20

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-7 items-center justify-center p-1.5"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <SunIcon
              key="light"
              size={ICON_SIZE}
              className="flex size-5 items-center justify-center"
            />
          ) : theme === "dark" ? (
            <MoonIcon
              key="dark"
              size={ICON_SIZE}
              className="flex size-5 items-center justify-center"
            />
          ) : (
            <LaptopMinimalCheckIcon
              key="system"
              size={ICON_SIZE}
              className="flex size-5 items-center justify-center"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem
            className="[&_svg.lucide-circle]:fill-airlume data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom flex cursor-pointer gap-2"
            value="light"
          >
            <SunIcon size={ICON_SIZE} className="text-primary-foreground/70" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom flex cursor-pointer gap-2"
            value="dark"
          >
            <MoonIcon size={ICON_SIZE} className="text-primary-foreground/70" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom flex cursor-pointer gap-2"
            value="system"
          >
            <LaptopMinimalCheckIcon
              size={ICON_SIZE}
              className="text-primary-foreground/70"
            />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeSwitcher }
