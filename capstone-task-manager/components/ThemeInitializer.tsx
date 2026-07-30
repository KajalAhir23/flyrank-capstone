"use client";

import { useEffect } from "react";
import { initTheme } from "@/lib/theme";

export function ThemeInitializer() {
  useEffect(() => {
    initTheme();
  }, []);

  return null;
}