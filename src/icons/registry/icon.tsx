import type { ReactNode } from "react";
import { clsx } from "clsx";
import { useOptionalContext } from "@semio/utils";
import { ICON_CLASS_NAME, ICON_LG_CLASS_NAME } from "../../constants/icon";
import { IconRegistryContext } from "./icon-context";
import { defaultIconRegistry } from "./default-registry";

/**
 * The value an `@semio/ui` icon slot accepts: either a **registry key** (string,
 * e.g. `"chevron-down"`) or an already-rendered node. `ReactNode` already permits
 * a string, so this alias is mostly documentation — but it signals that a bare
 * string handed to an icon slot is resolved as a registry key, not printed as text.
 */
export type IconValue = ReactNode;

/**
 * Normalizes an icon slot value for rendering: a string key becomes `<Icon name>`
 * (which self-sizes); anything else is returned unchanged. Call this wherever a
 * slot renders its icon, so consumers can write `icon="chevron-down"` **or**
 * `icon={<Icon name="chevron-down" />}` **or** `icon={<CustomGlyph />}`.
 */
export function resolveIcon(icon: IconValue): ReactNode {
  return typeof icon === "string" ? <Icon name={icon} /> : icon;
}

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
