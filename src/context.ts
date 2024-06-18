import type { ReactNode } from "react";
import { createContext } from "react";
import { Theme } from "./types";

export interface ThemeProviderProps {
  // Optionally, provide the store you want to
  children: ReactNode;
}

export interface ThemeContextValue {
  explicitTheme: Theme;
  systemPreference: Theme;
  setExplicitTheme: (theme: Theme) => void;
  resolvedTheme: Theme;
}

export const ThemeContext = createContext<ThemeContextValue>({
  explicitTheme: Theme.SYSTEM,
  systemPreference: Theme.DARK,
  setExplicitTheme: () => {},
  resolvedTheme: Theme.DARK,
});
