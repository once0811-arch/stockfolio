"use client";

import { useEffect, useState } from "react";

import type { ThemeMode } from "@/src/ui/types/theme";

const STORAGE_KEY = "portfolio-ops-theme";

function applyTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    return "light";
  });

  useEffect(() => {
    applyTheme(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return (
    <button
      type="button"
      className="ds-theme-toggle"
      aria-label="테마 전환"
      onClick={() => {
        const next = mode === "light" ? "dark" : "light";
        setMode(next);
      }}
    >
      {mode === "light" ? "Dark" : "Light"}
    </button>
  );
}
