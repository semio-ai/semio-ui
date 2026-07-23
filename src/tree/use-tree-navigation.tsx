import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { CompositeItem, CompositeRoot } from "@base-ui/react/internals/composite";

/**
 * Roving-focus adapter for hierarchical lists — the **only** module that
 * imports Base UI's `internals/composite`. If that path shifts (or graduates to
 * a public API), this file is the single point of change; everything else
 * consumes `TreeNavRoot` / `TreeNavItem`.
 *
 * Base UI's composite gives us the roving core: a single tab stop, Up/Down
 * (vertical orientation), Home/End, disabled-item skipping, and
 * scroll-into-view, all driven by a controlled `highlightedIndex`. Tree-specific
 * keys — Left/Right to collapse/expand, Enter/Space to select, edit-mode entry —
 * are layered by the consumer via `onKeyDown` (see `TreeGrid`).
 */

export interface TreeNavRootProps {
  /** Controlled roving-focus index (the keyboard cursor). */
  highlightedIndex: number;
  /** Notified when the composite moves the cursor (arrows/Home/End). */
  onHighlightedIndexChange: (index: number) => void;
  /** Wrap from last→first and first→last. */
  loop?: boolean;
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
      highlightedIndex={highlightedIndex}
      onHighlightedIndexChange={onHighlightedIndexChange}
      render={<div role={role} aria-label={ariaLabel} className={className} onKeyDown={onKeyDown} />}
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
  className?: string;
  /** Row-level key handling (tree keys / selection); colocated with `onClick`. */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
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
  className,
  onKeyDown,
  onClick,
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
          className={className}
          onKeyDown={onKeyDown}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </div>
      }
    />
  );
}
