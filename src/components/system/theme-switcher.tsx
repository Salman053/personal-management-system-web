"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Palette } from "lucide-react";

const THEMES = [
  "light",
  "dark",
  "serene",
  "solar",
  "aurora",
  "rosewood",
  "cyber",
  "emerald",
  "forest",
  "sunrise",
  "blossom",
  "love",
  "romance",
  "ocean",
  "sky",
] as const;

type Theme = (typeof THEMES)[number];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  // Load stored theme
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && THEMES.includes(stored)) {
      applyTheme(stored);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    // Reset
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.theme;

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme !== "light") {
      document.documentElement.dataset.theme = newTheme;
    }
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Palette className="h-4 w-4" />
          )}
          <span className="capitalize">{theme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map((t) => (
          <DropdownMenuItem className="hover:bg-green-300" key={t} onClick={() => applyTheme(t)}>
            <span
              className={`px-4 py-1 w-full rounded-sm  font-semibold capitalize
            transition-all duration-300
            ${theme === t && "bg-secondary text-white hover:text-foreground "}`}
            >
              {t}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
