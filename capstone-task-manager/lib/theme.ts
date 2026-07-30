/**
 * Simple dark/light theme store. Applies a "dark" class to <html>,
 * which globals.css uses to swap CSS variable values.
 */

type Theme = "light" | "dark";
const STORAGE_KEY = "taskflow.theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return (window.localStorage.getItem(STORAGE_KEY) as Theme) || "light";
}

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function initTheme() {
  applyTheme(getTheme());
}