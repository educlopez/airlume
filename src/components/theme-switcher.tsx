"use client"

import { useEffect, useState } from "react"
import { Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
        <Button variant="ghost" className="p-1.5" aria-label="Toggle theme">
          {theme === "light" ? (
            <Sun key="light" size={ICON_SIZE} />
          ) : theme === "dark" ? (
            <Moon key="dark" size={ICON_SIZE} />
          ) : (
            <Laptop key="system" size={ICON_SIZE} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem
            className="[&_svg.lucide-circle]:fill-sparkbites data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom flex cursor-pointer gap-2"
            value="light"
          >
            <Sun size={ICON_SIZE} className="text-primary-foreground/70" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom flex cursor-pointer gap-2"
            value="dark"
          >
            <Moon size={ICON_SIZE} className="text-primary-foreground/70" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom flex cursor-pointer gap-2"
            value="system"
          >
            <Laptop size={ICON_SIZE} className="text-primary-foreground/70" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeSwitcher }
