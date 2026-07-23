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
 * Resolved styling for a row. `bar` colors the left-edge indicator; `background`
 * tints the whole row. `null`/`undefined` means "nothing" (the layer still
 * renders an empty, transition-ready element so state changes animate).
 */
export interface RowVisual {
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

/** Neutral fallback: a faint tint on emphasis, a stronger tint + bar on
 *  selection. Theme-agnostic (grey with alpha reads in light and dark). */
export const defaultResolveRowVisual: ResolveRowVisual = (state) => {
  if (state.selected) {
    return { bar: "rgb(115 115 115 / 0.9)", background: "rgb(115 115 115 / 0.18)" };
  }
  if (state.emphasized) {
    return { background: "rgb(115 115 115 / 0.08)" };
  }
  return { bar: null, background: null };
};
