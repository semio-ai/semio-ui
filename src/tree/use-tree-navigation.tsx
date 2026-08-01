import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { CompositeItem, CompositeRoot } from "../internals/composite";

/**
 * Roving-focus adapter for **hierarchical, vertical** lists.
 *
 * The composite primitive is reached through `internals/composite`, the package's
 * single import site for that unstable path — never directly from here.
 *
 * Base UI's composite gives us the roving core: a single tab stop, Up/Down
 * (vertical orientation), Home/End, disabled-item skipping, and
 * scroll-into-view, all driven by a controlled `highlightedIndex`. Tree-specific
 * keys — Left/Right to collapse/expand, Enter/Space to select, edit-mode entry —
 * are layered by the consumer via `onKeyDown` (see `TreeGrid`).
 *
 * This adapter is deliberately vertical-and-tree-shaped rather than a general
 * roving-focus component. A two-dimensional pattern uses its own sibling adapter
 * (`layouts/use-grid-navigation`) over the same primitive, because orientation and
 * ARIA vocabulary are properties of the pattern, not options on a shared one — see
 * the note in `internals/composite`.
 */

export interface TreeNavRootProps {
  /** Controlled roving-focus index (the keyboard cursor). */
  highlightedIndex: number;
  /** Notified when the composite moves the cursor (arrows/Home/End). */
  onHighlightedIndexChange: (index: number) => void;
  /** Wrap from last→first and first→last. */
  loop?: boolean;
  /**
   * Modifier keys the composite should IGNORE when deciding whether to move
   * roving focus — i.e. it still navigates while these are held. By default the
   * composite bails on ANY modifier, so a consumer that layers modifier-aware
   * selection on arrows (e.g. `ListGrid`'s Shift/Cmd+Arrow) must pass the
   * modifiers it wants focus to keep moving under (e.g. `["Shift","Meta","Control"]`).
   */
  modifierKeys?: ("Shift" | "Control" | "Alt" | "Meta")[];
  /** Extra key handling layered on top of the composite (Left/Right, Enter…). */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /** ARIA role for the container; defaults to `tree`. */
  role?: string;
  /** Accessible name for the container. */
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
}

/** Roving-focus container. Vertical orientation with Home/End enabled. */
export function TreeNavRoot({
  highlightedIndex,
  onHighlightedIndexChange,
  loop = false,
  modifierKeys,
  onKeyDown,
  role = "tree",
  ariaLabel,
  className,
  children,
}: TreeNavRootProps) {
  return (
    <CompositeRoot
      orientation="vertical"
      enableHomeAndEndKeys
      loopFocus={loop}
      modifierKeys={modifierKeys}
      highlightedIndex={highlightedIndex}
      onHighlightedIndexChange={onHighlightedIndexChange}
      render={
        <div role={role} aria-label={ariaLabel} className={className} onKeyDown={onKeyDown} />
      }
    >
      {children}
    </CompositeRoot>
  );
}

export interface TreeNavItemProps {
  /** ARIA role for the row; defaults to `treeitem`. */
  role?: string;
  /** 1-based nesting level. */
  ariaLevel?: number;
  /** Expanded state (group rows only). */
  ariaExpanded?: boolean;
  /** Selection state (selectable rows). */
  ariaSelected?: boolean;
  /** Non-interactive row: sets `aria-disabled`, which the composite reads to
   *  skip it during roving navigation. Consumers also guard click/keydown. */
  disabled?: boolean;
  className?: string;
  /** Row-level key handling (tree keys / selection); colocated with `onClick`. */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onDoubleClick?: (event: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children?: ReactNode;
}

/**
 * One roving-focusable row. The rendered element is the composite's tab stop —
 * Base UI injects the roving `tabIndex`, focus handlers, and ref. Row *content*
 * (a `TreeRow`) is nested inside; interactive cell widgets keep their own focus
 * behavior. `onKeyDown` and `onClick` are colocated on the focusable `treeitem`,
 * so pointer and keyboard selection stay on one accessible element.
 */
export function TreeNavItem({
  role = "treeitem",
  ariaLevel,
  ariaExpanded,
  ariaSelected,
  disabled,
  className,
  onKeyDown,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: TreeNavItemProps) {
  return (
    <CompositeItem
      render={
        <div
          role={role}
          aria-level={ariaLevel}
          aria-expanded={ariaExpanded}
          aria-selected={ariaSelected}
          aria-disabled={disabled || undefined}
          className={className}
          onKeyDown={onKeyDown}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </div>
      }
    />
  );
}
