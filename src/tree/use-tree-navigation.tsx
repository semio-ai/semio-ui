import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useCompositeRoot } from "../internals/composite";

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
 *
 * ## Why this owns the element array
 *
 * Base UI's `CompositeRoot` component discovers its items from the DOM: each
 * `CompositeItem` registers itself, the registrations are sorted by document
 * position, and the resulting array is what every index calculation runs over —
 * Home/End, the bounds check, loop wrap-around, and the `focus()` call.
 *
 * That is the right design for a menu and the wrong one for a **windowed** list,
 * where the mounted rows are a moving slice of the data. Registration would make
 * "the last item" mean the last *rendered* row, so End would jump to the bottom of
 * the window rather than the bottom of the list, and an arrow at the window's edge
 * would find nothing to move to.
 *
 * So this adapter uses the `useCompositeRoot` hook and keeps the array itself, in
 * the **data's** index space: `total` entries long, with a live element at each
 * mounted row's index and a hole at every row that is scrolled out. The composite's
 * own arithmetic then lands on real data indices, because two of its helpers happen
 * to be exactly hole-tolerant enough:
 *
 * - `isIndexOutOfListBounds` compares against the array's `length`, which is `total`.
 * - `isListIndexDisabled` returns `false` for an absent element — a hole reads as an
 *   enabled row rather than a wall.
 *
 * Both are load-bearing and neither is a documented contract, so they are pinned by
 * `use-tree-navigation.browser.tsx`. If a Base UI upgrade changes either, those
 * tests fail rather than the behaviour silently degrading to window-sized
 * navigation in a consumer's app.
 *
 * A consequence for callers: an item's index is explicit (`TreeNavItem.index`)
 * rather than inferred from DOM order, and a windowed caller must pass **absolute**
 * indices. Disabled rows must be declared as `disabledIndices` too — the composite
 * otherwise reads `aria-disabled` off the elements, and an unrendered row has none.
 */

interface TreeNavContextValue {
  elementsRef: RefObject<(HTMLDivElement | null)[]>;
  tabStopIndex: number;
  onHighlightedIndexChange: (index: number) => void;
}

const TreeNavContext = createContext<TreeNavContextValue | null>(null);

export interface TreeNavRootProps {
  /** Controlled roving-focus index (the keyboard cursor), in data space. */
  highlightedIndex: number;
  /** Notified when the composite moves the cursor (arrows/Home/End). */
  onHighlightedIndexChange: (index: number) => void;
  /**
   * Which row carries `tabIndex=0`, when that cannot be the cursor's row.
   *
   * Defaults to {@link TreeNavRootProps.highlightedIndex}, and only differs for a
   * windowed list whose cursor has been scrolled out of the rendered slice. Something
   * must remain tabbable or the list drops out of the tab order entirely until the user
   * happens to scroll back; pointing the tab stop at a row that exists solves that
   * without moving the cursor, and focusing that row syncs the cursor to it through the
   * composite's own focus handling.
   */
  tabStopIndex?: number;
  /**
   * How many rows the list has **in total** — not how many are rendered. This is
   * the index space every keyboard calculation runs in, so a windowed list passes
   * its full row count and renders whichever slice it likes.
   */
  total: number;
  /**
   * Indices of non-interactive rows, in data space. Required for a windowed list
   * with disabled rows: without it the composite infers disabledness from each
   * element's `aria-disabled`, and a row that is scrolled out has no element to
   * read. Omit when no row is disabled.
   */
  disabledIndices?: number[];
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
  tabStopIndex,
  total,
  disabledIndices,
  loop = false,
  modifierKeys,
  onKeyDown,
  role = "tree",
  ariaLabel,
  className,
  children,
}: TreeNavRootProps) {
  const { props, elementsRef } = useCompositeRoot({
    orientation: "vertical",
    enableHomeAndEndKeys: true,
    loopFocus: loop,
    modifierKeys,
    highlightedIndex,
    onHighlightedIndexChange,
    disabledIndices,
    // `CompositeRoot` defaults this to true where the hook defaults to false;
    // keep the component's behaviour so a list nested in another composite does
    // not hand its navigation keys to the outer one.
    stopEventPropagation: true,
    // Vertical orientation never consults direction — it maps Up/Down only, and
    // the horizontal keys are the consumer's (`TreeGrid` spends Left/Right on
    // collapse/expand). Fixed rather than plumbed so this does not imply an RTL
    // behaviour it does not have.
    direction: "ltr",
  });

  // The array is as long as the DATA, not the mounted window. Runs after the
  // rows' refs have attached, so it extends with holes / truncates a shrunk list
  // without disturbing the entries the rows just wrote.
  useLayoutEffect(() => {
    if (elementsRef.current.length !== total) elementsRef.current.length = total;
  }, [elementsRef, total]);

  const context = useMemo(
    () => ({
      elementsRef,
      tabStopIndex: tabStopIndex ?? highlightedIndex,
      onHighlightedIndexChange,
    }),
    [elementsRef, tabStopIndex, highlightedIndex, onHighlightedIndexChange],
  );

  // Whether the keyboard is "in" this list, so a cursor move made while the user was
  // somewhere else entirely never pulls focus in.
  const hasFocusRef = useRef(false);
  const handleFocusIn = useCallback(() => {
    hasFocusRef.current = true;
  }, []);
  const handleFocusOut = useCallback((event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next && !event.currentTarget.contains(next)) hasFocusRef.current = false;
  }, []);

  // Hand focus to the cursor's row once that row exists.
  //
  // The composite focuses `elementsRef.current[next]` in a microtask after moving the
  // cursor, which finds nothing when the target is far outside the rendered window — an
  // End keypress in a ten-thousand-row list. The row arrives a commit or two later, once
  // the list has scrolled to it, and this delivers the focus that was owed.
  //
  // Strictly on a CURSOR MOVE, never on any render where focus merely is not on the
  // cursor's row. That distinction is the whole design: focus legitimately sits on a
  // control inside a row — a text field being typed into — and a rule of "put focus back
  // on the cursor" would yank it away on the next realtime re-render, which is the exact
  // focus theft `list-grid-reliability` exists to catch.
  const owedFocusRef = useRef<number | null>(null);
  const lastIndexRef = useRef(highlightedIndex);

  useEffect(() => {
    if (lastIndexRef.current === highlightedIndex) return;
    lastIndexRef.current = highlightedIndex;
    owedFocusRef.current = null;
    if (!hasFocusRef.current) return;
    const target = elementsRef.current[highlightedIndex];
    if (!target) {
      // Not mounted yet; the effect below delivers it when the row arrives.
      owedFocusRef.current = highlightedIndex;
      return;
    }
    if (document.activeElement !== target) target.focus();
  }, [highlightedIndex, elementsRef]);

  // The waiting half. No dependency array: a row mounting is not a value this can watch,
  // and with nothing owed it is a single null check.
  useEffect(() => {
    const owed = owedFocusRef.current;
    if (owed === null) return;
    const target = elementsRef.current[owed];
    if (!target) return;
    owedFocusRef.current = null;
    if (document.activeElement !== target) target.focus();
  });

  const { onKeyDown: compositeKeyDown, ...rootProps } = props;
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      compositeKeyDown?.(event);
      onKeyDown?.(event);
    },
    [compositeKeyDown, onKeyDown],
  );

  return (
    <TreeNavContext.Provider value={context}>
      <div
        {...rootProps}
        role={role}
        aria-label={ariaLabel}
        className={className}
        onKeyDown={handleKeyDown}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
      >
        {children}
      </div>
    </TreeNavContext.Provider>
  );
}

export interface TreeNavItemProps {
  /**
   * This row's index **in the data**, not in the rendered slice. Explicit because
   * the container owns the element array (see the note above); a windowed list
   * passes the absolute index of the row it is drawing.
   */
  index: number;
  /** ARIA role for the row; defaults to `treeitem`. */
  role?: string;
  /** 1-based nesting level. */
  ariaLevel?: number;
  /** Expanded state (group rows only). */
  ariaExpanded?: boolean;
  /** Selection state (selectable rows). */
  ariaSelected?: boolean;
  /**
   * Size of the set this row belongs to, and its 1-based position in it. A windowed
   * list must supply both: assistive technology otherwise counts the mounted rows and
   * reports the window's size as the list's.
   */
  ariaSetSize?: number;
  ariaPosInSet?: number;
  /** Non-interactive row: sets `aria-disabled`. Declare it in the container's
   *  `disabledIndices` as well, which is what roving navigation reads. Consumers
   *  also guard click/keydown. */
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
 * One roving-focusable row: the container's single tab stop when it is the
 * highlighted one, and `tabIndex={-1}` otherwise. Row *content* (a `TreeRow`) is
 * nested inside; interactive cell widgets keep their own focus behavior.
 * `onKeyDown` and `onClick` are colocated on the focusable `treeitem`, so pointer
 * and keyboard selection stay on one accessible element.
 *
 * Registers its element into the container's array at `index` and clears that slot
 * when it unmounts. The clearing matters under windowing: a detached node left
 * behind reads as *disabled* to the composite (it checks visibility), so a
 * scrolled-out row would become a permanent gap in Home/End and arrow navigation
 * instead of the hole it should be.
 */
export function TreeNavItem({
  index,
  role = "treeitem",
  ariaLevel,
  ariaExpanded,
  ariaSelected,
  ariaSetSize,
  ariaPosInSet,
  disabled,
  className,
  onKeyDown,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: TreeNavItemProps) {
  const context = useContext(TreeNavContext);
  if (!context) throw new Error("TreeNavItem must be rendered inside a TreeNavRoot.");
  const { elementsRef, tabStopIndex, onHighlightedIndexChange } = context;

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      // React passes `null` on unmount (and before re-attaching under a changed
      // index), which is what keeps a stale detached node out of the array.
      elementsRef.current[index] = node;
    },
    [elementsRef, index],
  );

  const handleFocus = useCallback(() => {
    onHighlightedIndexChange(index);
  }, [onHighlightedIndexChange, index]);

  return (
    <div
      ref={ref}
      role={role}
      tabIndex={index === tabStopIndex ? 0 : -1}
      aria-level={ariaLevel}
      aria-expanded={ariaExpanded}
      aria-selected={ariaSelected}
      aria-setsize={ariaSetSize}
      aria-posinset={ariaPosInSet}
      aria-disabled={disabled || undefined}
      className={className}
      onFocus={handleFocus}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
