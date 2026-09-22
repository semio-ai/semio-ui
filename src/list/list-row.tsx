import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
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

export interface ListRowProps extends NativeRowProps {
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
  /**
   * ARIA role for each cell — `gridcell` when this row is a `row` in a `grid`.
   *
   * A `row` owns cells and states so: without a role on them they are generic, the
   * accessibility tree prunes them, and the row is left owning nothing. It is the
   * cells that make a grid navigable, so this is not cosmetic. Left unset under
   * `option`, which owns no cells and where `gridcell` would be invalid.
   */
  cellRole?: string;
  ariaSelected?: boolean;
  /**
   * React 19+: `ref` arrives as an ordinary prop, so this is not supported on React 18.
   *
   * The row element. Used by a windowed list to measure the real row height, since
   * {@link ROW_HEIGHT} is a `rem` class and its px value depends on the consuming
   * app's root font size.
   */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Everything a row element natively accepts, minus the four this component owns.
 *
 * Widening to the native attributes rather than listing them is what lets a row be a
 * TRIGGER. A floating component — Radix's `asChild`, Base UI's `render` — puts its own
 * pointer handlers, `data-state` and ref onto the element it was given, and a closed
 * prop list drops every one of them silently: the row still renders, still reads
 * correctly, and simply never opens its menu.
 *
 * A row cannot take the usual escape hatch either. The wrapper that works for a
 * `Button` breaks a row outright, because rows lay their cells on the parent's tracks
 * with `grid-cols-subgrid` — an element between the grid and the row takes the row out
 * of that subgrid and every column stops lining up.
 *
 * `role`, `className` and `ref` are re-declared above so they can document what they
 * land on; `children` is not accepted at all, because a row's content is its `cells`.
 */
type NativeRowProps = Omit<HTMLAttributes<HTMLDivElement>, "role" | "className" | "children">;

/**
 * Edge length of a row's media tile — the square a thumbnail, or the glyph
 * standing in for one, occupies in a cell. Published as `--row-media`, which the
 * `sized-row-media` utility reads.
 *
 * The ROW owns this, not the cell. A cell can only name a number, and a number
 * states no ratio: two listings at different row sizes reach for the same
 * comfortable-looking tile and then disagree about the breathing around it, which
 * reads as the same object rendered two ways. Here it is one 4px step in from the
 * row on every edge — `ROW_HEIGHT` less 8px, in `../row-metrics`. That derivation is
 * the part worth checking when either table changes: these are literals, so widening a
 * row height does not widen the tile with it.
 */
const ROW_MEDIA: Record<Size, string> = {
  [Size.Xs]: "1rem", // 16px in h-6
  [Size.Sm]: "1.5rem", // 24px in h-8
  [Size.Md]: "1.75rem", // 28px in h-9
  [Size.Lg]: "2.25rem", // 36px in h-11
  [Size.Xl]: "2.75rem", // 44px in h-13
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
  cellRole,
  ariaSelected,
  ref,
  ...rest
}: ListRowProps) {
  return (
    <div
      // Native attributes first, so nothing a caller passes can displace the row's
      // own layout classes, its ref or its ARIA. Those four are destructured above and
      // therefore absent from `rest`; spreading last would still let a future addition
      // to that list land after them silently.
      {...rest}
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
      style={
        {
          ...(visual?.color ? { "--custom-color": visual.color } : {}),
          "--row-media": ROW_MEDIA[size],
        } as CSSProperties
      }
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
          role={cellRole}
          className={clsx(
            // `self-stretch` so a cell fills the row's height rather than hugging
            // its content. The row is `items-center`, so without it a cell is
            // exactly as tall as what it contains — and `truncate`'s
            // `overflow: hidden` then clips anything painted OUTSIDE the content
            // box. `Button`'s `inverted-border` visual is an `outline`, and outlines
            // paint outside the box, so an outlined control in a cell lost its top
            // and bottom edges and rendered as two floating side strokes. Focus
            // rings on any embedded control had the same problem. Shrinking the
            // control does not help: the cell hugs it at every size.
            //
            // Content stays centred by the cell's own `items-center`, so the
            // rendered layout is unchanged — the cell just has room around it now.
            "relative flex min-w-0 items-center self-stretch truncate",
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
