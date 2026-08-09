import type { CSSProperties, ReactNode, Ref } from "react";
import { clsx } from "clsx";
import { Size } from "../types";
import { ROW_HEIGHT } from "../row-metrics";
import { TreeIndent } from "./tree-indent";
import type { RowVisual } from "./resolve-row-visual";

export interface TreeRowProps {
  /** Nesting depth (0 = top-level). Drives indentation via {@link TreeIndent}. */
  depth: number;
  /**
   * Content of the indent column's rightmost slot: an expand toggle for groups
   * (see {@link TreeToggle}) or a type icon for leaves. Callers decide — a
   * group row that is also editable still gets a toggle here and an `editor`.
   */
  icon?: ReactNode;
  /** Per-ancestor "is last child" flags for guide-lines; see {@link TreeIndent}. */
  ancestorIsLast?: boolean[];
  /** Width of each nesting slot in pixels. */
  slotWidth?: number;
  /** Primary label (usually a name or an editable text field). Fills the row. */
  label?: ReactNode;
  /**
   * Optional value editor. Present for leaves and for group rows that expose an
   * aggregate control — "has children" and "has an editor" are independent, so
   * this slot is never suppressed by depth or group-ness.
   */
  editor?: ReactNode;
  /** Trailing controls (options menu, per-row action buttons, key strip, …). */
  actions?: ReactNode;
  /**
   * Resolved styling for the standardized left-bar + background. Produce it with
   * a {@link ResolveRowVisual} (default {@link defaultResolveRowVisual}); the
   * consumer injects its own to map interaction state → colors. Both layers are
   * always rendered so state changes transition smoothly.
   */
  visual?: RowVisual;
  className?: string;
  /**
   * Opt-in ARIA seams for consumers that implement full tree semantics. Left
   * unset by default: this primitive does not assert `role` on its own. A
   * consumer (or the composed `TreeGrid`) that adds keyboard navigation passes
   * `role="row"`/`"treeitem"` plus `ariaLevel` (1-based), and `ariaExpanded` on
   * group rows / `ariaSelected` on selectable rows, to opt in cleanly.
   */
  role?: string;
  /** 1-based nesting level (`depth + 1`); only meaningful with a tree/row role. */
  ariaLevel?: number;
  /** Expanded state for a group row; only meaningful with a tree role. */
  ariaExpanded?: boolean;
  /** Selection state for a selectable row; only meaningful with a tree role. */
  ariaSelected?: boolean;
  /**
   * Row height / content size, from the rhythm `ListRow` shares — so a tree and a listing
   * at the same `Size` are the same height. Defaults to `Md` (`h-9`), the density the rest
   * of the product is anchored to.
   *
   * Changes the box, not the number of lines in it: a row is a single line at every size.
   */
  size?: Size;
  /**
   * React 19+: `ref` arrives as an ordinary prop, so this is not supported on React 18.
   *
   * The row element. Used by a windowed tree to measure the real row height, since the
   * height is a `rem` value and its px equivalent depends on the consuming app's root
   * font size.
   */
  ref?: Ref<HTMLDivElement>;
}

/**
 * One row of a hierarchical, collapsible list: an indent/icon column, a label
 * that fills available width, an optional value editor, and trailing actions —
 * over a standardized left-bar + background layer.
 *
 * Row *content* (label/editor/actions) is entirely the consumer's, injected as
 * slots; nothing domain-specific is baked in. Row *styling* is driven by the
 * `visual` prop, which a consumer produces from interaction state via an
 * injected resolver. Row-level *interaction* (selection gestures, hover
 * emphasis) is not wired here — the composed `TreeGrid` or a consumer wrapper
 * owns it, which keeps accessibility with whoever owns the gesture.
 */
export function TreeRow({
  depth,
  icon,
  ancestorIsLast,
  slotWidth,
  label,
  editor,
  actions,
  visual,
  className,
  role,
  ariaLevel,
  ariaExpanded,
  ariaSelected,
  size = Size.Md,
  ref,
}: TreeRowProps) {
  return (
    <div
      ref={ref}
      className={clsx(
        // `responsive` + the row's variant/custom-color set --accent-color for
        // this row, so the bar/background below resolve to its theme/custom color.
        "responsive relative flex w-full items-center",
        // Row height = one step taller than its content, from the shared table; `size`
        // rides along as a class so controls in the row inherit the content size, exactly
        // as `ListRow` does it.
        ROW_HEIGHT[size],
        size,
        // Readable foreground by default, for the same reason as `ListRow`: a row
        // must not depend on an ancestor supplying one, or it renders as the UA
        // default black on a dark surface.
        "text-neutral-900 dark:text-neutral-100",
        visual?.color ? "custom-color" : visual?.variant,
        className,
      )}
      style={visual?.color ? ({ "--custom-color": visual.color } as CSSProperties) : undefined}
      role={role}
      aria-level={ariaLevel}
      aria-expanded={ariaExpanded}
      aria-selected={ariaSelected}
    >
      {/* Background tint — always present so selection/hover changes transition. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-150 ease-out"
        style={{ backgroundColor: visual?.background ?? "transparent" }}
      />
      {/* Left-edge indicator bar. */}
      <div className="relative h-full w-[3px] shrink-0">
        <div
          aria-hidden
          className="h-full w-full transition-colors duration-150 ease-out"
          style={{ backgroundColor: visual?.bar ?? "transparent" }}
        />
      </div>
      <TreeIndent depth={depth} icon={icon} ancestorIsLast={ancestorIsLast} slotWidth={slotWidth} />
      <div className="relative min-w-0 flex-1 truncate">{label}</div>
      {editor !== undefined && <div className="relative min-w-0 shrink-0">{editor}</div>}
      {actions !== undefined && (
        <div className="relative flex shrink-0 items-center">{actions}</div>
      )}
    </div>
  );
}
