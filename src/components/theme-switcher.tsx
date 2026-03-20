"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LaptopMinimalCheckIcon } from "./icons/laptop-minimal-check";
import { MoonIcon } from "./icons/moon";
import { SunIcon } from "./icons/sun";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 20;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Toggle theme"
          className="size-7 items-center justify-center p-1.5"
          variant="ghost"
        >
          {theme === "light" && (
            <SunIcon
              className="flex size-5 items-center justify-center"
              key="light"
              size={ICON_SIZE}
            />
          )}
          {theme === "dark" && (
            <MoonIcon
              className="flex size-5 items-center justify-center"
              key="dark"
              size={ICON_SIZE}
            />
          )}
          {theme !== "light" && theme !== "dark" && (
            <LaptopMinimalCheckIcon
              className="flex size-5 items-center justify-center"
              key="system"
              size={ICON_SIZE}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-content">
        <DropdownMenuRadioGroup
          onValueChange={(e) => setTheme(e)}
          value={theme}
        >
          <DropdownMenuRadioItem
            className="flex cursor-pointer gap-2 data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom [&_svg.lucide-circle]:fill-airlume"
            value="light"
          >
            <SunIcon className="text-primary-foreground/70" size={ICON_SIZE} />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="flex cursor-pointer gap-2 data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom"
            value="dark"
          >
            <MoonIcon className="text-primary-foreground/70" size={ICON_SIZE} />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="flex cursor-pointer gap-2 data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[highlighted]:shadow-custom"
            value="system"
          >
            <LaptopMinimalCheckIcon
              className="text-primary-foreground/70"
              size={ICON_SIZE}
            />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
