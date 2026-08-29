import {
  createContext,
  useCallback,
  useContext,
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
  /**
   * How many rows the grid has in total, for a container whose `role` is `grid`.
   *
   * Stated rather than counted, which is what a windowed grid needs: with rows
   * mounted only near the viewport, assistive technology counting the DOM would
   * report the window's size as the grid's. Rows carry the matching
   * {@link TreeNavItemProps.ariaRowIndex}.
   *
   * A `listbox` or `tree` container leaves this unset — neither role defines it, and
   * both place their items with `aria-setsize`/`aria-posinset` on the item instead.
   */
  ariaRowCount?: number;
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
  ariaRowCount,
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
  // somewhere else entirely never pulls focus in, and the row that focus is owed to once
  // the list catches up with the cursor (see the effects below). Declared together
  // because leaving the list has to cancel the debt, which is `handleFocusOut`'s job.
  const hasFocusRef = useRef(false);
  const owedFocusRef = useRef<number | null>(null);
  const handleFocusIn = useCallback(() => {
    hasFocusRef.current = true;
  }, []);
  const handleFocusOut = useCallback((event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next && !event.currentTarget.contains(next)) {
      hasFocusRef.current = false;
      // Cancel any focus still owed to a row. Leaving it set would let a row that mounts
      // long afterwards pull focus back out of wherever the user went; a null
      // `relatedTarget` — the removal case — deliberately does not reach here, because
      // that debt is still owed.
      owedFocusRef.current = null;
    }
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
  //
  // ## Why these are layout effects, and why the root is a landing pad
  //
  // Removing the focused element drops focus to `document.body`, and in a windowed list
  // the cursor's own movement is what removes it: the window slides to follow the cursor
  // and takes the row the user was standing on out of the DOM. While focus is on the body
  // the list is not listening, and every keystroke that arrives in the meantime is
  // delivered to the body and silently discarded.
  //
  // The obvious half of the answer is to restore focus in the layout phase, so a removal
  // and the refocus that answers it happen in one synchronous commit with no chance for
  // the event loop to interleave. That is necessary but not sufficient, and the shortfall
  // is worth stating because it is what a plausible-looking fix misses: when the cursor
  // moves FASTER than the list can scroll — every keystroke of a type-ahead query — the
  // owed row is not the row that this commit is mounting. Typing `r7000` moves the cursor
  // to row 70, then to row 700 before the window has caught up to 70; the commit that
  // finally arrives removes the old focused row and mounts row 70, but by then row 700 is
  // what is owed, so nothing here can be focused and the body holds focus across a whole
  // scroll-and-commit cycle. Measured at ~10ms, which swallowed the last `0` of `r7000`
  // and left the cursor a keystroke short at row 700 — the intermittent failure of
  // `list-grid-virtual`'s type-ahead test.
  //
  // So focus is never allowed to reach the body: when the owed row is absent, the ROOT
  // takes focus until that row arrives. The root is deliberately the landing pad rather
  // than some nearby mounted row, because a row would sync the cursor to itself through
  // `TreeNavItem`'s `onFocus` and drag the cursor back from where type-ahead just sent it,
  // and because keys aimed at a row (Space, Enter) would act on the wrong one. Keys that
  // land on the root still reach the consumer through `onKeyDown`, which is what lets
  // `ListGrid` answer them against the CURSOR's row rather than the focused element's.
  const lastIndexRef = useRef(highlightedIndex);
  const rootRef = useRef<HTMLDivElement>(null);

  /** Focus the owed row if it exists, else park on the root so keys stay in the list. */
  const settleFocus = useCallback(
    (owed: number) => {
      // Guards BOTH halves, and belongs above them. A debt owed to a row is owed to a
      // keyboard that is still here: once the user has gone elsewhere, delivering it later
      // is not finishing the job, it is dragging them back. That case is reachable because
      // the debt outlives the render that incurred it — the row may mount minutes later,
      // when a mouse-scroll happens to bring it into the window.
      if (!hasFocusRef.current) return;
      const target = elementsRef.current[owed];
      if (target) {
        owedFocusRef.current = null;
        if (document.activeElement !== target) target.focus();
        return;
      }
      owedFocusRef.current = owed;
      const root = rootRef.current;
      if (!root) return;
      // Narrowly: only when focus was LOST, meaning the body ended up with it because the
      // element holding it was removed. "Not inside this list" is the wrong test and was a
      // real bug — focus is legitimately elsewhere all the time, most sharply in a dialog
      // this list just opened, and a list whose data changes underneath it (a delete
      // confirmed in that dialog) moves its cursor and would reclaim focus mid-confirmation.
      const active = document.activeElement;
      if (active !== null && active !== document.body) return;
      root.focus({ preventScroll: true });
    },
    [elementsRef],
  );

  useLayoutEffect(() => {
    if (lastIndexRef.current === highlightedIndex) return;
    lastIndexRef.current = highlightedIndex;
    owedFocusRef.current = null;
    if (!hasFocusRef.current) return;
    settleFocus(highlightedIndex);
  }, [highlightedIndex, settleFocus]);

  // The waiting half. No dependency array: a row mounting is not a value this can watch,
  // and with nothing owed it is a single null check.
  useLayoutEffect(() => {
    const owed = owedFocusRef.current;
    if (owed === null) return;
    settleFocus(owed);
  });

  // The composite supplies its own root `ref`, so this takes it out of the spread and
  // merges it — attaching `rootRef` over the top would silently detach the composite from
  // its own element, which reads as roving navigation simply not working.
  const { onKeyDown: compositeKeyDown, ref: compositeRef, ...rootProps } = props;
  const setRootNode = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof compositeRef === "function") return compositeRef(node);
      if (compositeRef) compositeRef.current = node;
      return undefined;
    },
    [compositeRef],
  );
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
        ref={setRootNode}
        role={role}
        // The composite reports the orientation it was configured with. This adapter is
        // vertical by construction and never plumbs it, and `tree` and `listbox` are both
        // vertical by default — so the attribute says nothing they do not already say,
        // while `grid` does not define it at all. Dropped rather than gated on `role`: no
        // role this adapter serves gains anything from it.
        aria-orientation={undefined}
        aria-rowcount={ariaRowCount}
        aria-label={ariaLabel}
        className={className}
        // Focusable programmatically but never a tab stop — that stays a row's job, so
        // the list keeps exactly one entry in the tab order.
        tabIndex={-1}
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
   *
   * `option` and `treeitem` are placed this way and no other. `row` permits the pair
   * too, but there it answers a different question — position among **sibling rows at
   * one level**, which is what a `treegrid` needs and a flat grid does not have. A
   * flat grid's row is placed by {@link TreeNavItemProps.ariaRowIndex} against the
   * container's {@link TreeNavRootProps.ariaRowCount}, so supplying both pairs states
   * one fact in two vocabularies rather than adding anything.
   */
  ariaSetSize?: number;
  ariaPosInSet?: number;
  /**
   * This row's 1-based position **in the full data**, for a row whose `role` is
   * `row`. Absolute rather than window-relative for the same reason
   * {@link TreeNavItemProps.index} is: the rendered slice begins wherever the scroll
   * left it, so a position counted from the top of the DOM would name the wrong row.
   * Pairs with the container's {@link TreeNavRootProps.ariaRowCount}.
   *
   * Counted over **every** row the grid owns, header rows included — this and
   * {@link TreeNavRootProps.ariaRowCount} are one numbering, so a grid that gains or
   * loses a header row moves both.
   */
  ariaRowIndex?: number;
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
  ariaRowIndex,
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
      aria-rowindex={ariaRowIndex}
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
