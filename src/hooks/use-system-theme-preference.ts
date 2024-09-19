import { useEffect, useState } from "react";
import { Theme } from "../types";

/**
 * Custom hook that returns the preferred system theme.
 *
 * @returns The preferred system theme, either `Theme.Dark` or `Theme.Light`.
 */
export function useSystemThemePreference(): Theme.Dark | Theme.Light {
  const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
  const [theme, setTheme] = useState<Theme.Dark | Theme.Light>(
    darkModePreference.matches ? Theme.Dark : Theme.Light,
  );

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? Theme.Dark : Theme.Light);
    };
    darkModePreference.addEventListener("change", listener);
    return () => {
      darkModePreference.removeEventListener("change", listener);
    };
  });

  return theme;
}
