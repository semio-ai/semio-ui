import type { ReactNode } from "react";
import { createContext } from "react";
import { Theme } from "./types";

export interface ThemeProviderProps {
  children: ReactNode;
}

export interface ThemeContextValue {
  explicitTheme: Theme; // Should only be light, dark, or system.
  systemPreference: Theme; // Should only be light or dark.
  setExplicitTheme: (theme: Theme) => void;
  resolvedTheme: Theme.Dark | Theme.Light;
}

/**
 * The context for managing the theme in the application.
 */
export const ThemeContext = createContext<ThemeContextValue>({
  explicitTheme: Theme.System,
  systemPreference: Theme.Dark,
  setExplicitTheme: () => {},
  resolvedTheme: Theme.Dark,
});
