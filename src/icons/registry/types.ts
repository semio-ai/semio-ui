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
