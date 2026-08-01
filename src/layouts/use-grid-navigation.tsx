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
 * a single tab stop with roving `tabIndex`, Left/Right by one and Up/Down by a
 * whole row (`orientation="both"` + `cols`), Home/End, `aria-disabled` skipping,
 * scroll-into-view, and optional wrapping — all driven by a controlled
 * `highlightedIndex`. Selection, activation and type-ahead are the consumer's,
 * layered via `onKeyDown` (see `CardGrid`).
 */
export interface GridNavRootProps {
  /** Controlled roving-focus index (the keyboard cursor). */
  highlightedIndex: number;
  /** Notified when the composite moves the cursor (arrows/Home/End). */
  onHighlightedIndexChange: (index: number) => void;
  /**
   * Items per row, which is what turns Up/Down into a *row* step rather than a
   * neighbour step.
   *
   * Must be the count actually in effect: a responsive grid
   * (`sm:grid-cols-2 lg:grid-cols-4`) changes it with the container's width, so a
   * consumer should measure the resolved `grid-template-columns` rather than
   * hardcode a number the CSS can silently disagree with.
   */
  cols: number;
  /** Wrap from last→first and first→last. */
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

/** Roving-focus container for a 2D layout. `listbox` with Home/End enabled. */
export function GridNavRoot({
  highlightedIndex,
  onHighlightedIndexChange,
  cols,
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
      orientation="both"
      cols={cols}
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
