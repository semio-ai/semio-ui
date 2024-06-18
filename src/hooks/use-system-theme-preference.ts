import { useEffect, useState } from "react";
import { Theme } from "../types";

export function useSystemThemePreference(): Theme.DARK | Theme.LIGHT {
  const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
  const [theme, setTheme] = useState<Theme.DARK | Theme.LIGHT>(
    darkModePreference.matches ? Theme.DARK : Theme.LIGHT,
  );

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? Theme.DARK : Theme.LIGHT);
    };
    darkModePreference.addEventListener("change", listener);
    return () => {
      darkModePreference.removeEventListener("change", listener);
    };
  }, []);

  return theme;
}
