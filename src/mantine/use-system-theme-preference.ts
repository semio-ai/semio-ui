import { useState, useEffect } from "react";

export function useSystemThemePreference(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const darkModePreference = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    return darkModePreference.matches ? "dark" : "light";
  });

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };
    const darkModePreference = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    darkModePreference.addEventListener("change", listener);
    return () => {
      darkModePreference.removeEventListener("change", listener);
    };
  }, []);

  return theme;
}
