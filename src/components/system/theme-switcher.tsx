"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { APP_THEMES, useAppTheme, isDarkTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const THEME_SWATCHES: Record<(typeof APP_THEMES)[number], string> = {
  light: "linear-gradient(135deg, #ffffff 50%, #f2f3f5 50%)",
  dark: "linear-gradient(135deg, #1c1f27 50%, #0e1116 50%)",
  serene: "linear-gradient(135deg, #a5b4fc 50%, #eef2ff 50%)",
  ocean: "linear-gradient(135deg, #0891b2 50%, #e2f6fb 50%)",
  sky: "linear-gradient(135deg, #3b82f6 50%, #e6f0fe 50%)",
  rosewood: "linear-gradient(135deg, #ec4899 50%, #fce9f2 50%)",
  romance: "linear-gradient(135deg, #db2777 50%, #fde7f2 50%)",
  love: "linear-gradient(135deg, #8b5cf6 50%, #f2e9ff 50%)",
  emerald: "linear-gradient(135deg, #10b981 50%, #ddf9ed 50%)",
  sunrise: "linear-gradient(135deg, #f59e0b 50%, #fef3cd 50%)",
  blossom: "linear-gradient(135deg, #e11d48 50%, #ffe4ea 50%)",
  forest: "linear-gradient(135deg, #34d399 50%, #0a1f14 50%)",
  solar: "linear-gradient(135deg, #f59e0b 50%, #1a1307 50%)",
  aurora: "linear-gradient(135deg, #38bdf8 50%, #0a1424 50%)",
  cyber: "linear-gradient(135deg, #d946ef 50%, #0a0a12 50%)",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {isDarkTheme(theme) ? (
            <Moon className="h-4 w-4" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Palette className="h-4 w-4" />
          )}
          <span className="hidden capitalize sm:inline">{theme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="grid grid-cols-4 gap-2 p-2">
          {APP_THEMES.map((t) => {
            const active = theme === t;
            return (
              <button
                key={t}
                type="button"
                title={t.charAt(0).toUpperCase() + t.slice(1)}
                onClick={() => setTheme(t)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border p-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-pressed={active}
              >
                <span
                  className={cn(
                    "h-8 w-full rounded-md border border-border/60 shadow-sm transition-transform group-hover:scale-105",
                    active && "ring-2 ring-ring ring-offset-1"
                  )}
                  style={{ background: THEME_SWATCHES[t] }}
                />
                <span className="w-full truncate text-center text-[10px] font-medium capitalize text-muted-foreground group-hover:text-foreground">
                  {t}
                </span>
                {active && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}