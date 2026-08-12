/**
 * Pure theme constants and helpers.
 * This module has no React / "use client" dependency so it can be imported
 * from both server components (for the theme init script) and client
 * components (ThemeProvider).
 */

export const APP_THEMES = [
  "light",
  "dark",
  "serene",
  "ocean",
  "sky",
  "rosewood",
  "romance",
  "love",
  "emerald",
  "sunrise",
  "blossom",
  "forest",
  "solar",
  "aurora",
  "cyber",
] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = "light";

export const THEME_STORAGE_KEY = "pms-theme";

const DARK_THEMES: readonly AppTheme[] = [
  "dark",
  "forest",
  "solar",
  "aurora",
  "cyber",
];

export const AVAILABLE_THEMES: readonly string[] = APP_THEMES;

export function isAppTheme(value: string | null): value is AppTheme {
  return !!value && (AVAILABLE_THEMES as readonly string[]).includes(value);
}

export function isDarkTheme(theme: AppTheme): boolean {
  return DARK_THEMES.includes(theme);
}

/**
 * Inline script injected in <head> so the correct theme is applied before
 * first paint. Plain JS to avoid blocking render and SSR issues.
 */
export function themeInitScript(): string {
  const opts = {
    themes: AVAILABLE_THEMES,
    darkThemes: DARK_THEMES,
    storageKey: THEME_STORAGE_KEY,
    fallback: DEFAULT_THEME,
  };

  return `(function(){try{
    var opts=${JSON.stringify(opts)};
    var stored=localStorage.getItem(opts.storageKey);
    var theme=opts.themes.indexOf(stored)!==-1?stored:opts.fallback;
    var root=document.documentElement;
    root.setAttribute('data-theme',theme);
    if(opts.darkThemes.indexOf(theme)!==-1){root.classList.add('dark');
    }else{root.classList.remove('dark');}
  }catch(e){}})();`;
}