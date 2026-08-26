import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { CompositeItem, CompositeRoot } from "../internals/composite";

/**
 * Roving-focus adapter for **two-dimensional** layouts — a grid of cards, tiles or
 * thumbnails.
 *
 * The sibling of `tree/use-tree-navigation`: same Base UI composite primitive,
 * reached through the same single import site (`internals/composite`), configured
 * for a different UI pattern. They are separate adapters rather than one
 * parameterized module because orientation, ARIA vocabulary and element structure
 * are properties of a pattern, not options on a shared one — see the note in
 * `internals/composite`. Each stays a dozen readable lines; neither accumulates
 * flags as new patterns appear.
 *
 * What the composite provides here, none of which the consumer implements:
 * a single tab stop with roving `tabIndex`, Left/Right by one, Home/End,
 * `aria-disabled` skipping, scroll-into-view, and optional wrapping — all driven
 * by a controlled `highlightedIndex`. Selection, activation and type-ahead are the
 * consumer's, layered via `onKeyDown` (see `CardGrid`).
 *
 * **Up/Down is ours, and resolved from GEOMETRY rather than from a column count.**
 * The composite can step a whole row given `cols`, but that number does not exist
 * anywhere in CSS — it had to be measured back out of the resolved
 * `grid-template-columns` on a `ResizeObserver` and handed in, which is a layout
 * fact reconstructed in JavaScript and kept in sync by hand.
 *
 * Two things follow that a column count cannot give:
 *
 * - **A PARTIAL last row moves.** With four columns and six items, Down from the
 *   fourth card has no `index + cols` to go to, so it refused to move at all;
 *   geometry lands on the nearest card in the row below, which is what the cursor
 *   looks like it should do.
 * - **It cannot disagree with the screen.** The measurement read
 *   `grid-template-columns` off the container, which is a DECLARED value — true
 *   only if the items are actually laid out by those tracks. They were not in this
 *   package's own test harness, where the composite's `display: contents` comes
 *   from a utility class and the compiled stylesheet is absent, so every item was
 *   stacked in a block while the count reported three. The arithmetic and the
 *   assertions agreed with each other and neither matched the render.
 */
export interface GridNavRootProps {
  /** Controlled roving-focus index (the keyboard cursor). */
  highlightedIndex: number;
  /** Notified when the composite moves the cursor (arrows/Home/End). */
  onHighlightedIndexChange: (index: number) => void;
  /** Wrap from last→first and first→last, on both axes. */
  loop?: boolean;
  /**
   * Modifier keys the composite should IGNORE when deciding whether to move
   * roving focus — i.e. it still navigates while these are held. By default it
   * bails on ANY modifier, so a consumer layering modifier-aware selection on
   * arrows (Cmd+Arrow to move focus only, Shift+Arrow to extend) must list them.
   */
  modifierKeys?: ("Shift" | "Control" | "Alt" | "Meta")[];
  /** Extra key handling layered on top of the composite (Enter, Space, Escape…). */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /** ARIA role for the container; defaults to `listbox`. */
  role?: string;
  /** Accessible name for the container. */
  ariaLabel?: string;
  /** Set for a `multiple`-selection grid. */
  ariaMultiselectable?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Rows are decided by what OVERLAPS vertically, not by an exact top edge.
 *
 * Cards in one row can start at different heights — a taller neighbour stretches
 * the row while a shorter card sits inside it — so "same row" has to mean "these
 * boxes share vertical space", and "below" has to mean "starts past where this one
 * ends". A tolerance absorbs sub-pixel layout and fractional device ratios.
 */
const ROW_EPSILON = 4;

/**
 * The item directly above or below `fromIndex`, or `null` when the cursor is
 * already in the first/last row and wrapping is off.
 *
 * Nearest ROW first, then nearest horizontal centre within it. Doing it in that
 * order is what makes a partial final row behave: the cursor lands on the closest
 * card in the row below rather than on nothing, whether that row is full, short,
 * centred, or spread.
 */
function verticalTarget(
  container: HTMLElement,
  fromIndex: number,
  direction: "up" | "down",
  loop: boolean,
): number | null {
  // By ROLE, not by `container.children`: Base UI renders the items through its own
  // `CompositeList`, so they are descendants rather than direct children and a child
  // walk finds a wrapper instead. Document order matches item order, so the query's
  // index IS the item index.
  //
  // The two roles are the ones `GridNavItem` can carry — `option` in a selectable
  // grid, `gridcell` in a presentational one. The coupling is deliberate and narrow:
  // a third role would need adding here, an edit in this file, rather than
  // navigation quietly doing nothing.
  const items = [...container.querySelectorAll<HTMLElement>('[role="option"], [role="gridcell"]')];
  const origin = items[fromIndex];
  if (!origin) return null;

  const from = origin.getBoundingClientRect();
  const centre = from.left + from.width / 2;
  const down = direction === "down";

  const candidates = items
    .map((el, index) => ({ index, rect: el.getBoundingClientRect(), el }))
    .filter(({ index, el, rect }) => {
      if (index === fromIndex) return false;
      if (el.getAttribute("aria-disabled") === "true") return false;
      if (rect.width === 0 && rect.height === 0) return false;
      return down ? rect.top >= from.bottom - ROW_EPSILON : rect.bottom <= from.top + ROW_EPSILON;
    });

  if (candidates.length === 0) {
    if (!loop) return null;
    // Wrap to the far row, then fall through to the same horizontal choice, so a
    // wrapped cursor lands under the column it left rather than at an end.
    const far = items
      .map((el, index) => ({ index, rect: el.getBoundingClientRect(), el }))
      .filter(({ el, rect }) => el.getAttribute("aria-disabled") !== "true" && rect.height > 0);
    if (far.length === 0) return null;
    const edge = down
      ? Math.min(...far.map((c) => c.rect.top))
      : Math.max(...far.map((c) => c.rect.top));
    return nearestInRow(far, edge, centre);
  }

  const rowEdge = down
    ? Math.min(...candidates.map((c) => c.rect.top))
    : Math.max(...candidates.map((c) => c.rect.top));
  return nearestInRow(candidates, rowEdge, centre);
}

/** Move DOM focus onto the item at `index`, if it is still there. */
function focusItem(container: HTMLElement, index: number): void {
  const items = container.querySelectorAll<HTMLElement>('[role="option"], [role="gridcell"]');
  items[index]?.focus();
}

/** Of the items on `rowTop`, the one whose centre is closest to `centre`. */
function nearestInRow(
  candidates: { index: number; rect: DOMRect }[],
  rowTop: number,
  centre: number,
): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (const { index, rect } of candidates) {
    if (Math.abs(rect.top - rowTop) > ROW_EPSILON) continue;
    const distance = Math.abs(rect.left + rect.width / 2 - centre);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
}

/** Roving-focus container for a 2D layout. `listbox` with Home/End enabled. */
export function GridNavRoot({
  highlightedIndex,
  onHighlightedIndexChange,
  loop = false,
  modifierKeys,
  onKeyDown,
  role = "listbox",
  ariaLabel,
  ariaMultiselectable,
  className,
  children,
}: GridNavRootProps) {
  return (
    <CompositeRoot
      // HORIZONTAL, so the composite owns Left/Right and leaves the vertical axis
      // alone — `verticalKeyDown` below answers it from the rendered geometry.
      orientation="horizontal"
      enableHomeAndEndKeys
      loopFocus={loop}
      modifierKeys={modifierKeys}
      highlightedIndex={highlightedIndex}
      onHighlightedIndexChange={onHighlightedIndexChange}
      render={
        <div
          role={role}
          aria-label={ariaLabel}
          aria-multiselectable={ariaMultiselectable}
          className={className}
          // CAPTURE, so the vertical axis is settled before the composite or the
          // consumer sees the key. Nothing is stopped from propagating: the
          // composite ignores Up/Down at `orientation="horizontal"`, and a consumer
          // layering its own handling should still get the event.
          onKeyDownCapture={(event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            if (event.defaultPrevented) return;
            const target = verticalTarget(
              event.currentTarget,
              highlightedIndex,
              event.key === "ArrowDown" ? "down" : "up",
              loop,
            );
            // Prevented even when nothing moves: the cursor is at the edge of the
            // grid, and scrolling the page out from under it is not the answer.
            event.preventDefault();
            if (target === null) return;
            onHighlightedIndexChange(target);
            // And move DOM focus, which the composite does for its OWN navigation
            // but not for an index changed from outside it. Without this the
            // controlled index advances while focus stays put — selection follows,
            // the highlight moves, and the next arrow key is computed from a
            // cursor the keyboard is not actually on.
            focusItem(event.currentTarget, target);
          }}
          onKeyDown={onKeyDown}
        />
      }
    >
      {children}
    </CompositeRoot>
  );
}

export interface GridNavItemProps {
  /** ARIA role for the item; defaults to `option`. */
  role?: string;
  /** Selection state. */
  ariaSelected?: boolean;
  /**
   * Non-interactive item: sets `aria-disabled`, which the composite reads to skip
   * it during roving navigation. Consumers also guard click/keydown.
   */
  disabled?: boolean;
  className?: string;
  /** Item-level key handling (selection/activation); colocated with `onClick`. */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onDoubleClick?: (event: MouseEvent<HTMLElement>) => void;
  children?: ReactNode;
}

/**
 * One roving-focusable grid cell. The rendered element is the composite's tab stop
 * — Base UI injects the roving `tabIndex`, focus handlers and ref, so a consumer
 * never manages focus itself. Item *content* (a `Card`) nests inside; interactive
 * widgets within it keep their own focus behaviour.
 *
 * Note there is no `ariaLevel`/`ariaExpanded` here, unlike `TreeNavItem`: a grid
 * has no hierarchy to express, and carrying tree vocabulary into it would be dead
 * weight. That divergence is the reason these are two adapters.
 */
export function GridNavItem({
  role = "option",
  ariaSelected,
  disabled,
  className,
  onKeyDown,
  onClick,
  onDoubleClick,
  children,
}: GridNavItemProps) {
  return (
    <CompositeItem
      render={
        // `aria-disabled` on the rendered element, not a `disabled` prop:
        // `CompositeItem` has none, and the composite reads the ARIA attribute to
        // decide what to skip. Same as `TreeNavItem`.
        <div
          role={role}
          aria-selected={ariaSelected}
          aria-disabled={disabled || undefined}
          className={className}
          onKeyDown={onKeyDown}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          {children}
        </div>
      }
    />
  );
}
