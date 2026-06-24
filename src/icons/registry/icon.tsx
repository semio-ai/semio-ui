import type { ReactNode } from "react";
import { clsx } from "clsx";
import { useOptionalContext } from "@semio/utils";
import { ICON_CLASS_NAME, ICON_LG_CLASS_NAME } from "../../constants/icon";
import { IconRegistryContext } from "./icon-context";
import { defaultIconRegistry, type IconName } from "./default-registry";

/**
 * The value an `@semio/ui` icon slot accepts: a **registry key** (string,
 * resolved via the registry) or an already-rendered node. A bare string handed
 * to a slot is resolved as a registry key, not printed as text — `resolveIcon`
 * does the dispatch.
 *
 * This currently aliases `ReactNode` (permissive: any string or node). It is the
 * single seam through which slot-level key checking will tighten — once
 * consumers register their keys, narrowing the string arm to {@link IconName}
 * here turns a mistyped slot key into a build error everywhere at once, with no
 * per-component change. Direct `<Icon name>` usage is already key-checked via
 * `IconProps["name"]`.
 */
export type IconValue = ReactNode;

/**
 * Normalizes an icon slot value for rendering: a string key becomes `<Icon name>`
 * (which self-sizes); anything else is returned unchanged. Call this wherever a
 * slot renders its icon, so consumers can write `icon="chevron-down"` **or**
 * `icon={<Icon name="chevron-down" />}` **or** `icon={<CustomGlyph />}`.
 */
export function resolveIcon(icon: IconValue): ReactNode {
  // A string slot value is a registry key by contract. The cast is the one
  // controlled bridge from the permissive `IconValue` to the checked
  // `IconProps["name"]`; unknown keys still warn + render nothing at runtime.
  return typeof icon === "string" ? <Icon name={icon as IconName} /> : icon;
}

export interface IconProps {
  /**
   * Registry key, kebab-case (e.g. `"chevron-down"`). Typed as {@link IconName},
   * so a key not in the active registry (default keys plus any a consumer
   * registers via `IconRegistryKeys` augmentation) is a build error.
   */
  name: IconName;
  className?: string;
  /**
   * Sizing preset. `"standard"` (60% of the slot), `"larger"` (70%), or `"none"`
   * to skip the standard sizing class — for bespoke slots that size the glyph
   * themselves via `className` (e.g. the stepper's `h-6 w-6`, the checkbox check).
   */
  size?: "standard" | "larger" | "none";
  /**
   * Extra props forwarded to the resolved icon component — the "state bag" for
   * stateful glyphs (`<Icon name="disclosure" open />`, `<Icon name="key" dashed
   * center="plus" />`). Untyped here by design; prefer the typed wrappers
   * (`<KeyIcon>`, `<DisclosureIcon>`) at call sites that need checked props.
   */
  [prop: string]: unknown;
}

/**
 * Resolves `name` against the active icon registry (nearest `IconProvider`, else
 * the default) and renders it at the standardized size. Sizing lives here — the
 * single source of truth — so consuming components only need to supply the slot.
 *
 * Any props beyond `name`/`className`/`size` are forwarded to the resolved icon,
 * so a single key can render state-dependent glyphs (rotation, swap, fill)
 * without the consuming component branching on state itself.
 *
 * Unknown names render nothing and, outside production, warn in the console.
 */
export function Icon({ name, className, size = "standard", ...rest }: IconProps) {
  const registry = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  // Own-property check so an unexpected `name` (e.g. "toString", "constructor")
  // can't resolve an inherited Object.prototype member instead of an icon.
  const Resolved = Object.hasOwn(registry, name) ? registry[name] : undefined;

  if (!Resolved) {
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      console.warn(`<Icon> unknown name "${name}". Register it via <IconProvider>.`);
    }
    return null;
  }

  const sizeClass =
    size === "none" ? undefined : size === "larger" ? ICON_LG_CLASS_NAME : ICON_CLASS_NAME;
  return <Resolved className={clsx(sizeClass, className)} {...rest} />;
}
