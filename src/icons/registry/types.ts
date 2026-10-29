import type { ComponentType } from "react";

/**
 * An icon is any component that accepts a `className` — Tabler icons, @semio/ui's
 * own custom glyphs, or anything a consumer registers. Identity is a string key
 * (see {@link IconRegistry}); sizing is applied centrally by `<Icon>`.
 *
 * Beyond `className`, an icon may accept an arbitrary **state bag** — extra props
 * `<Icon>` forwards through (e.g. the disclosure chevron's `open`, the keyframe
 * glyph's `dashed`/`center`). This is how a single key renders different glyph
 * states (rotation, swap, fill) without a one-off branch in the consuming
 * component: the variation logic lives in the icon component itself, and an
 * override just has to honor the same props. The `Record<string, unknown>` is the
 * deliberately-loose seam — everyday call sites stay typed via literal-key
 * `<Icon name="check">` or the typed wrappers (`<KeyIcon>`, `<DisclosureIcon>`).
 */
export type IconComponent = ComponentType<{ className?: string } & Record<string, unknown>>;

/** Maps a kebab-case icon key (`"chevron-down"`) to its concrete component. */
export type IconRegistry = Record<string, IconComponent>;

/**
 * Build-time registry of valid icon keys, **augmentable by consumers**.
 *
 * `@semio/ui` leaves this empty, so by default `IconName` is just the keys of the
 * default registry (see {@link IconName}). A consumer that registers
 * app-specific icons via `<IconProvider>` widens the checked key set by
 * declaration-merging the keys of the registry object it already maintains — no
 * duplication, derived straight from the source of truth:
 *
 * ```ts
 * // apps/studio — every <Icon name> / icon slot is now checked against these too.
 * declare module "@semio/ui" {
 *   interface IconRegistryKeys
 *     extends Record<keyof typeof studioIconRegistry, true> {}
 * }
 * ```
 *
 * Because augmentation follows the dependency graph, each package sees exactly
 * its own keys plus those of its dependencies: `@semio/timeline-editor` is checked
 * against `default ∪ animation`, `apps/studio` against `default ∪ animation ∪
 * studio`. The value type (`true`) is irrelevant — only the keys are read.
 */
export interface IconRegistryKeys {}
