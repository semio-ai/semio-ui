import type { Variant } from "../types";

/**
 * The row's interaction state, as the shared layer understands it. This is the
 * input to a visual resolver — deliberately domain-free (no track color, no
 * playback flag). Consumers fold their own domain data in through the resolver's
 * second argument.
 */
export interface RowInteractionState {
  /** Roving-focus target (keyboard cursor). */
  focused: boolean;
  /** In the current selection. */
  selected: boolean;
  /** Pointer/keyboard emphasis (hover-equivalent). */
  emphasized: boolean;
  /** The current range anchor. */
  anchor: boolean;
}

/**
 * Resolved styling for a row.
 *
 * Color is expressed the same way as the rest of the UI library so tables/trees
 * stay consistent AND each row can be colored independently:
 * - `variant` picks a theme palette (theme-aware; flips in dark mode).
 * - `color` overrides with an arbitrary custom color (a per-row hex/rgb, e.g. an
 *   animation track color). Takes precedence over `variant`.
 * The row applies these as the design-system `variant-scope` + variant/`custom-color`
 * classes, so `bar`/`background` can reference `var(--accent-color)` and resolve
 * to that row's variant/color.
 *
 * `bar` colors the left-edge indicator; `background` tints the whole row.
 * `null`/`undefined` means "nothing" (the layer still renders an empty,
 * transition-ready element so state changes animate).
 */
export interface RowVisual {
  /** Theme palette for this row (defaults to the neutral `Default`). */
  variant?: Variant;
  /** Arbitrary per-row color; overrides `variant`. */
  color?: string;
  bar?: string | null;
  background?: string | null;
}

/**
 * Maps interaction state (+ injected domain data) to a row's styling. This is
 * the seam that detaches the *visualization* (shared bar/background rendering in
 * `TreeRow`) from *what activates it*. Consumers inject their own: the animation
 * editor's three-tier, track-colored, playback-greyed `useRowBackground` becomes
 * one of these.
 */
export type ResolveRowVisual<TData = unknown> = (
  state: RowInteractionState,
  data: TData,
) => RowVisual;

/**
 * Default: a faint tint on emphasis, a stronger tint + solid bar on selection —
 * driven by the theme-aware `--accent-color` (via the row's `variant-scope` class),
 * so it adapts to light/dark and to any per-row `variant`/`color`. With the
 * neutral `Default` variant this reads like the previous grey; a consumer's
 * resolver can return `{ variant }` or `{ color }` per row (spreading this
 * default) to recolor selection without recomputing intensities.
 */
export const defaultResolveRowVisual: ResolveRowVisual = (state) => {
  if (state.selected) {
    return {
      bar: "var(--accent-color)",
      background: "color-mix(in oklab, var(--accent-color) 18%, transparent)",
    };
  }
  if (state.emphasized) {
    return { background: "color-mix(in oklab, var(--accent-color) 8%, transparent)" };
  }
  return { bar: null, background: null };
};
