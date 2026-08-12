"use client";

import * as React from "react";
import {
  APP_THEMES,
  type AppTheme,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

export { APP_THEMES, DEFAULT_THEME };
export type { AppTheme };
export { isDarkTheme, themeInitScript } from "@/lib/theme";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useAppTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<AppTheme>(DEFAULT_THEME);

  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* ignore */
    }

    let initial: AppTheme = DEFAULT_THEME;
    if ((APP_THEMES as readonly string[]).includes(stored as string)) {
      initial = stored as AppTheme;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initial = prefersDark ? "dark" : "light";
    }
    applyTheme(initial, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (next: AppTheme, persist = true) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    // The `.dark` class is kept for library components (calendar, etc.) that
    // toggle their dark styling based on it.
    root.classList.toggle(
      "dark",
      next === "dark" ||
        next === "forest" ||
        next === "solar" ||
        next === "aurora" ||
        next === "cyber"
    );
    setThemeState(next);
    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    }
  };

  const setTheme = React.useCallback((next: AppTheme) => applyTheme(next), []);
  const toggleTheme = React.useCallback(() => {
    applyTheme(
      theme === "dark" ||
        theme === "forest" ||
        theme === "solar" ||
        theme === "aurora" ||
        theme === "cyber"
        ? "light"
        : "dark"
    );
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}