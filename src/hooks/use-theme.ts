import { useContext } from "react";
import { ThemeContext, ThemeContextValue } from "../context";

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
