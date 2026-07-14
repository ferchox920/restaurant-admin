"use client";

import { ReactNode, useEffect } from "react";
import { initializeTheme } from "@/lib/theme/theme-store";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    initializeTheme();
  }, []);

  return children;
}
