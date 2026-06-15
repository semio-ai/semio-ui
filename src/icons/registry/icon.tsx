import { clsx } from "clsx";
import { useOptionalContext } from "@semio/utils";
import { ICON_CLASS_NAME, ICON_LG_CLASS_NAME } from "../../constants/icon";
import { IconRegistryContext } from "./icon-context";
import { defaultIconRegistry } from "./default-registry";

export interface IconProps {
  /** Registry key, kebab-case (e.g. `"chevron-down"`). */
  name: string;
  className?: string;
  /** Sizing preset. `"standard"` (60% of the slot) or `"larger"` (70%). */
  size?: "standard" | "larger";
}

/**
 * Resolves `name` against the active icon registry (nearest `IconProvider`, else
 * the default) and renders it at the standardized size. Sizing lives here — the
 * single source of truth — so consuming components only need to supply the slot.
 *
 * Unknown names render nothing and, outside production, warn in the console.
 */
export function Icon({ name, className, size = "standard" }: IconProps) {
  const registry = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  const Resolved = registry[name];

  if (!Resolved) {
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      console.warn(`<Icon> unknown name "${name}". Register it via <IconProvider>.`);
    }
    return null;
  }

  const sizeClass = size === "larger" ? ICON_LG_CLASS_NAME : ICON_CLASS_NAME;
  return <Resolved className={clsx(sizeClass, className)} />;
}
