import { Size } from "./types";

/**
 * The vertical rhythm every row-shaped list in the system shares.
 *
 * Lives here, above both `list/` and `tree/`, because it is one convention rather than
 * two: a `ListRow` and a `TreeRow` at the same `Size` are the same height, and a listing
 * next to a tree should not look like two differently-built things. Keeping the numbers in
 * one module is what makes that checkable, instead of a pair of tables that agree until
 * someone edits one.
 */

/**
 * Row height per content `Size` — the shared convention: a list/tree row is a container
 * **one 4px step taller** than the content `sized-height` inside it (Xs h-5→h-6 … Md
 * h-8→h-9 … Xl h-12→h-13).
 *
 * `Md` is the anchor. It is `h-9`, which is what `TreeRow` was fixed at and what the
 * animation package's track rows use, so the default in every row-shaped list is the same
 * 36px and the density of the product does not depend on which component a surface reached
 * for.
 *
 * A row is a single line at every size. These heights change the box, not the number of
 * lines in it — content that does not fit is the consumer's to shorten (truncate, drop a
 * column, move it to a detail view), never a reason for the row to grow.
 */
export const ROW_HEIGHT: Record<Size, string> = {
  [Size.Xs]: "h-6",
  [Size.Sm]: "h-8",
  [Size.Md]: "h-9",
  [Size.Lg]: "h-11",
  [Size.Xl]: "h-13",
};

/**
 * The same heights in px, for the **first paint** of a windowed list — which has to know
 * how tall a row is before it has rendered one to measure.
 *
 * An estimate, not the truth, and named so. These are the `rem` values above resolved at a
 * 16px root, so they are exact in an app that leaves the root font size alone and wrong in
 * one that does not. `useRowWindow` measures a real row and corrects itself; this only has
 * to be close enough that the first window is roughly the right size.
 */
export const ROW_HEIGHT_PX: Record<Size, number> = {
  [Size.Xs]: 24,
  [Size.Sm]: 32,
  [Size.Md]: 36,
  [Size.Lg]: 44,
  [Size.Xl]: 52,
};
