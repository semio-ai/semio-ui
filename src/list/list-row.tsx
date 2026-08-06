import type { CSSProperties, ReactNode, Ref } from "react";
import { clsx } from "clsx";
import { Size } from "../types";
import type { RowVisual } from "../tree/resolve-row-visual";
// The row rhythm is shared with `TreeRow`, so it lives above both of them. Re-exported
// here because this module was its home and callers import it from this path.
import { ROW_HEIGHT, ROW_HEIGHT_PX } from "../row-metrics";

export { ROW_HEIGHT, ROW_HEIGHT_PX };

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
