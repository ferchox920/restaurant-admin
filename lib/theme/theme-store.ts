"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme/theme-constants";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const listeners = new Set<() => void>();

let currentTheme: ThemePreference = "system";
let initialized = false;

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

function emitThemeChange() {
  listeners.forEach((listener) => listener());
}

function handleSystemThemeChange() {
  if (currentTheme !== "system") {
    return;
  }

  applyTheme(currentTheme);
  emitThemeChange();
}

export function initializeTheme() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  currentTheme = isThemePreference(storedTheme) ? storedTheme : "system";
  applyTheme(currentTheme);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", handleSystemThemeChange);
}

export function setThemePreference(theme: ThemePreference) {
  currentTheme = theme;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  applyTheme(theme);
  emitThemeChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initializeTheme();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return `${currentTheme}:${resolveTheme(currentTheme)}`;
}

function getServerSnapshot() {
  return "system:light";
}

export function useThemePreference() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [theme, resolvedTheme] = snapshot.split(":") as [
    ThemePreference,
    ResolvedTheme,
  ];

  return {
    theme,
    resolvedTheme,
    setTheme: setThemePreference,
    toggleTheme: () =>
      setThemePreference(resolvedTheme === "dark" ? "light" : "dark"),
  };
}
