import type { ComponentType } from "react";

/**
 * An icon is any component that accepts a `className` — Tabler icons, @semio/ui's
 * own custom glyphs, or anything a consumer registers. Identity is a string key
 * (see {@link IconRegistry}); sizing is applied centrally by `<Icon>`.
 */
export type IconComponent = ComponentType<{ className?: string }>;

/** Maps a kebab-case icon key (`"chevron-down"`) to its concrete component. */
export type IconRegistry = Record<string, IconComponent>;
