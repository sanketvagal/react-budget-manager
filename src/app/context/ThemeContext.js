"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system"); // "light" | "dark" | "system"

  // Read persisted preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rbm-theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      } else {
        setTheme("system");
      }
    } catch {
      // ignore
    }
  }, []);

  // Apply theme to <html data-theme> and optional class for easier styling
  useEffect(() => {
    const root = document.documentElement;
    const systemDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effective =
      theme === "system" ? (systemDark ? "dark" : "light") : theme;

    root.dataset.theme = effective;

    // Maintain a .dark class for optional dark: utilities if used
    if (effective === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Keep theme in sync when system preference changes and theme === system
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setTheme((prev) => (prev === "system" ? "system" : prev));
    };
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (t) => {
        setTheme(t);
        try {
          if (t === "system") localStorage.removeItem("rbm-theme");
          else localStorage.setItem("rbm-theme", t);
        } catch {
          // ignore
        }
      },
      toggleTheme: () => {
        setTheme((prev) => {
          const next = prev === "dark" ? "light" : "dark";
          try {
            localStorage.setItem("rbm-theme", next);
          } catch {
            // ignore
          }
          return next;
        });
      },
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
