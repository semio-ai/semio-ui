import type { ReactElement, ReactNode } from "react";
import { clsx } from "clsx";
import { useOptionalContext } from "../../context/context-providers";
import { ICON_CLASS_NAME, ICON_LG_CLASS_NAME } from "../../constants/icon";
import { IconRegistryContext } from "./icon-context";
import { defaultIconRegistry, type IconName } from "./default-registry";

/**
 * The value an `@semio/ui` icon slot accepts: either a **registry key** ({@link
 * IconName}, resolved via the registry) or an already-rendered element. Typing
 * the string arm as `IconName` rather than bare `string` is what makes a mistyped
 * slot key a build error at the call site — the same check direct `<Icon name>`
 * gets, extended to every slot (`Button` `leftIcon`, `Chip` `icon`, …).
 *
 * The node arm is `ReactElement` (plus the `null`/`undefined`/`false` from
 * conditional rendering) rather than the full `ReactNode`: `ReactNode` includes
 * `string`, and `Exclude<ReactNode, string>` does not actually strip it in the
 * React 19 types — so a `ReactNode` arm would silently re-admit arbitrary strings
 * and defeat the key check. Elements are the only node form an icon slot needs.
 */
export type IconValue = IconName | ReactElement | null | undefined | false;

/**
 * Normalizes an icon slot value for rendering: a string key becomes `<Icon name>`
 * (which self-sizes); anything else is returned unchanged. Call this wherever a
 * slot renders its icon, so consumers can write `icon="chevron-down"` **or**
 * `icon={<Icon name="chevron-down" />}` **or** `icon={<CustomGlyph />}`.
 */
export function resolveIcon(icon: IconValue): ReactNode {
  // A string here narrows to IconName (the only string arm of IconValue), so the
  // key is already checked at the call site — no cast needed.
  return typeof icon === "string" ? <Icon name={icon} /> : icon;
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
