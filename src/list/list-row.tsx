import type { CSSProperties, ReactNode, Ref } from "react";
import { clsx } from "clsx";
import { Size } from "../types";
import type { RowVisual } from "../tree/resolve-row-visual";

/** Layout description of one column, as the row needs it (no `render`). */
export interface ListRowColumn {
  key: string;
  align?: "left" | "center" | "right";
  /** Extra cell classes (e.g. a container-query `@max-*:hidden` for responsive
   *  column hiding). Applied to both this row's cell and its header cell. */
  className?: string;
}

export interface ListRowProps {
  /** Column layout, in display order. Drives the subgrid cell alignment. */
  columns: ListRowColumn[];
  /** Rendered cell content, parallel to {@link columns}. */
  cells: ReactNode[];
  /**
   * Resolved styling for the standardized left-bar + background — the SAME seam
   * as `TreeRow`, so tables and trees read as one system. Both layers always
   * render so state changes transition smoothly.
   */
  visual?: RowVisual;
  /** Row height / content size. Matches the tree row rhythm via `sized-height`. */
  size?: Size;
  className?: string;
  /** Opt-in ARIA (the composed `ListGrid` sets `row`/`option` + selection). */
  role?: string;
  ariaSelected?: boolean;
  /**
   * The row element. Used by a windowed list to measure the real row height, since
   * {@link ROW_HEIGHT} is a `rem` class and its px value depends on the consuming
   * app's root font size.
   */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Row height per content `Size` — the shared convention: a list/tree row is a
 * container **one 4px step taller** than the content `sized-height` inside it
 * (Xs h-5→h-6 … Md h-8→h-9 … Xl h-12→h-13). Md = `h-9` deliberately matches the
 * fixed-height `TreeRow`, so `ListGrid` and `TreeGrid` share one vertical rhythm.
 */
const ROW_HEIGHT: Record<Size, string> = {
  [Size.Xs]: "h-6",
  [Size.Sm]: "h-8",
  [Size.Md]: "h-9",
  [Size.Lg]: "h-11",
  [Size.Xl]: "h-13",
};

/**
 * The same heights in px, for the **first paint** of a windowed list — which has to
 * know how tall a row is before it has rendered one to measure.
 *
 * An estimate, not the truth, and named so. These are the `rem` values above resolved
 * at a 16px root, so they are exact in an app that leaves the root font size alone and
 * wrong in one that does not. `useRowWindow` measures a real row and corrects itself;
 * this only has to be close enough that the first window is roughly the right size.
 */
export const ROW_HEIGHT_PX: Record<Size, number> = {
  [Size.Xs]: 24,
  [Size.Sm]: 32,
  [Size.Md]: 36,
  [Size.Lg]: 44,
  [Size.Xl]: 52,
};

const alignClass = (align: ListRowColumn["align"]) =>
  align === "right"
    ? "justify-end text-right"
    : align === "center"
      ? "justify-center text-center"
      : "justify-start text-left";

/**
 * One row of a flat, column-aligned list: a subgrid of cells over a standardized
 * left-bar + background layer. It is the flat analog of `TreeRow` — same visual
 * seam (`RowVisual`), same fixed single-line rhythm — but lays its cells out on
 * the parent grid's column tracks (`grid-cols-subgrid`) so columns line up across
 * every row. Cell *content* is the consumer's, injected by `ListGrid`; row-level
 * interaction (selection, roving) is owned by `ListGrid`.
 */
export function ListRow({
  columns,
  cells,
  visual,
  size = Size.Md,
  className,
  role,
  ariaSelected,
  ref,
}: ListRowProps) {
  return (
    <div
      ref={ref}
      role={role}
      aria-selected={ariaSelected}
      className={clsx(
        // Full-bleed to the container — no outer padding, no rounding — matching
        // the hierarchical rows (TreeRow). The selection tint/bar are `inset-0`.
        "relative col-span-full grid grid-cols-subgrid items-center",
        // Readable foreground by default. Without this a row inherits whatever
        // its host page supplies, and a page that supplies nothing falls through
        // to the UA default black — fine on light, unreadable on dark. The column
        // headers in `ListGrid` already declare their own colour, so a listing
        // rendered outside a themed panel had legible headers above illegible
        // rows. Selection is expressed by `visual.bar` / `visual.background`,
        // never by text colour, so setting this unconditionally is safe.
        "text-neutral-900 dark:text-neutral-100",
        // `responsive` + the row's variant/custom-color set --accent-color for
        // this row, so the bar/background resolve to its theme/custom color.
        "responsive",
        visual?.color ? "custom-color" : visual?.variant,
        // Row height = one step taller than content (shared tree/list rhythm);
        // `size` still rides along so cell controls inherit the content size.
        ROW_HEIGHT[size],
        size,
        className,
      )}
      style={visual?.color ? ({ "--custom-color": visual.color } as CSSProperties) : undefined}
    >
      {/* Background tint — always present so selection/hover changes transition. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-150 ease-out"
        style={{ backgroundColor: visual?.background ?? "transparent" }}
      />
      {/* Left-edge indicator bar (overlay in the reserved leading gutter, so it
          never consumes a column track nor overlaps cell content). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] transition-colors duration-150 ease-out"
        style={{ backgroundColor: visual?.bar ?? "transparent" }}
      />
      {columns.map((column, i) => (
        <div
          key={column.key}
          className={clsx(
            "relative flex min-w-0 items-center truncate",
            // Inner cell padding: content breathing room + the first cell clears
            // the 3px indicator bar, so nothing overlaps it or hits the edges.
            "px-2",
            alignClass(column.align),
            column.className,
          )}
          style={{ gridColumn: `${(i + 1).toString()} / span 1` } as CSSProperties}
        >
          {cells[i]}
        </div>
      ))}
    </div>
  );
}
