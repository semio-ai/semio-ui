import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { Size } from "../types";
import { useClickAway } from "../hooks/use-click-away";
import { useRowWindow } from "../hooks/use-row-window";
import { defaultResolveRowVisual, type ResolveRowVisual } from "../tree/resolve-row-visual";
import { TreeNavItem, TreeNavRoot } from "../tree/use-tree-navigation";
import { useTreeSelection } from "../tree/use-tree-selection";
import { ListRow, ROW_HEIGHT_PX } from "./list-row";

export type SelectionMode = "none" | "single" | "multiple";

/** Container-query breakpoints for {@link ListColumn.hideBelow}. Widths match
 *  Tailwind's container sizes (xs 320 · sm 384 · md 448 · lg 512 · xl 576 px). */
export type ListBreakpoint = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Literal `@max-*:hidden` classes (NOT built dynamically) so Tailwind's JIT
 * emits them. Hiding happens purely in CSS via a container query on the grid —
 * no `ResizeObserver`, no track recomputation, no flash. A hidden column's cells
 * become `display:none`; because such columns are `auto` tracks (see
 * `hideBelow`), the empty track collapses to 0 on its own.
 */
const HIDE_BELOW_CLASS: Record<ListBreakpoint, string> = {
  xs: "@max-xs:hidden",
  sm: "@max-sm:hidden",
  md: "@max-md:hidden",
  lg: "@max-lg:hidden",
  xl: "@max-xl:hidden",
};

/** A column: layout + a cell renderer that sees the row's interaction state. */
export interface ListColumn<T> {
  key: string;
  header?: ReactNode;
  align?: "left" | "center" | "right";
  /** Grow to fill leftover width (`1fr`); otherwise the column is `auto`. */
  flex?: boolean;
  /**
   * Hide this column when the grid's container is narrower than the breakpoint
   * (pure CSS container query). Hiding relies on an `auto` track collapsing to 0
   * once the cells are `display:none`, so a `hideBelow` column is always an
   * `auto` track — `flex` is ignored for it.
   */
  hideBelow?: ListBreakpoint;
  /**
   * Fixed track width (any CSS length), replacing `auto`/`1fr` for this column.
   *
   * Rarely needed: the point of `auto` tracks is that a column is as wide as its
   * content, and {@link ListGridProps.virtualized} keeps that true without letting
   * the width move around (see the note on track floors). Reach for this only when a
   * column must be a specific width regardless of content.
   */
  width?: string;
  /**
   * Lower bound for the track, as a CSS length. Composes with the measured floor a
   * virtualized list maintains — the wider of the two wins — so this is the way to
   * stop a column collapsing when its visible cells happen to be empty.
   */
  minWidth?: string;
  /** Cell content. `state` lets a cell reflect focus/selection (the old
   *  TableList's 3-arg `render(value, focused, selected)`). */
  render: (item: T, state: { focused: boolean; selected: boolean }) => ReactNode;
}

export interface ListGridProps<T> {
  data: T[];
  /** Stable id for a row (selection/focus key). */
  getRowId: (item: T) => string;
  /** Whether a row is non-interactive (skipped by roving + selection). */
  isRowDisabled?: (item: T) => boolean;
  columns: ListColumn<T>[];

  // Selection (controlled/uncontrolled) — see useTreeSelection.
  selectionMode?: SelectionMode;
  selected?: Iterable<string>;
  defaultSelected?: Iterable<string>;
  onSelectionChange?: (next: Set<string>) => void;
  disallowEmptySelection?: boolean;
  /** Clicking outside the list clears the selection (unless empty selection is
   *  disallowed). Defaults to true, matching the old TableList. */
  deselectOnClickAway?: boolean;
  /**
   * Plain arrow navigation also moves selection to the newly-focused row
   * (Finder/listbox "selection follows focus"). Shift+arrow extends, Cmd/Ctrl+
   * arrow moves focus only. Defaults on for single/multiple, ignored for `none`.
   */
  selectionFollowsFocus?: boolean;

  /** Activation (Enter / click in `none` mode / double-purpose). */
  onAction?: (id: string, event: KeyboardEvent | MouseEvent) => void;

  // Type-ahead
  allowTypeAhead?: boolean;
  getSearchText?: (item: T) => string;

  /**
   * Render only the rows near the viewport instead of all of them.
   *
   * Off by default, and deliberately opt-in rather than automatic above some row
   * count: it requires a scroll container ({@link ListGridProps.scrollRef}) that only
   * the consumer can identify, and it changes what "as wide as its content" means for
   * a column, which is a visible trade rather than an optimization to apply behind a
   * caller's back.
   *
   * What it costs: an `auto` column is sized by the cells the browser can see, so
   * under windowing that is the *rendered* rows, and the column would resize as you
   * scroll — measured at around 100px of lateral shift on a column holding mixed-width
   * values, which reads as the table rearranging itself under the reader. So a
   * windowed list also maintains a **floor** per auto track: the widest that track has
   * been since the data, the columns, or the container's width last changed. Columns
   * still size to content and still respond to the container; they just grow into
   * place and never snap back mid-scroll. {@link ListColumn.minWidth} sets a floor up
   * front, {@link ListColumn.width} opts out of content sizing entirely.
   */
  virtualized?: boolean;
  /**
   * The element that scrolls, required by {@link ListGridProps.virtualized}. For a
   * list inside a `ScrollArea`, this is that component's `viewportRef` — the Radix
   * viewport is what scrolls, and the `ScrollArea` root is not.
   */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Rows rendered beyond each edge of the viewport. Defaults to 6. */
  overscan?: number;
  noHeader?: boolean;
  size?: Size;
  loop?: boolean;
  resolveVisual?: ResolveRowVisual<T>;
  className?: string;
  ariaLabel?: string;
  notFound?: ReactNode;
}

const TYPE_AHEAD_RESET_MS = 1000;

/** Stand-in for a caller that passed no `scrollRef`; only read while windowing is off. */
const emptyScrollRef: RefObject<HTMLElement | null> = { current: null };

/** The keys the Base-UI composite treats as roving navigation. When they come
 *  from an in-row control we stop their propagation so focus never roves out of
 *  a field mid-edit. */
const COMPOSITE_NAV_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

// Selection is reflected by the shared left-bar + background (`resolveVisual`),
// the SAME seam as `TreeGrid` — no checkbox/radio indicator column. That keeps
// list and tree one visual system; multi-select uses click / Cmd+click /
// Shift+click / Cmd+A, exactly like the tree.

/**
 * Flat, column-aligned, selectable, keyboard-navigable list — the flat analog of
 * `TreeGrid`, built on the SAME shared engine (`useTreeSelection` +
 * `applySelection` with `rangeMode: "replace"`) and the Base-UI roving-focus
 * adapter. Reliability by construction: focus is declarative (no imperative
 * `ref.focus()`), hover is a separate channel from focus, and keystrokes inside a
 * cell control never trigger row navigation — so in-row inputs/buttons keep their
 * focus and typing is never stolen.
 *
 * Keyboard: Up/Down/Home/End move focus (composite); in single/multiple with
 * `selectionFollowsFocus`, plain arrows also select, Shift extends (replace-range),
 * Cmd/Ctrl moves focus only; Space toggles; Enter activates (`onAction`); Cmd/Ctrl+A
 * selects all (multiple); Escape clears; printable keys type-ahead.
 *
 * ## Scale
 *
 * **Renders every row by default — it is not windowed unless you ask.** Fine into the
 * hundreds; at thousands the mount cost and the DOM size are both linear and it is the
 * wrong component to reach for. Pass {@link ListGridProps.virtualized} with a
 * {@link ListGridProps.scrollRef} and only the rows near the viewport are rendered, with
 * selection, type-ahead and Home/End still spanning the whole data set. `useRowWindow` is
 * exported separately for a consumer composing the row primitives directly.
 */
export function ListGrid<T>({
  data,
  getRowId,
  isRowDisabled,
  columns,
  selectionMode = "none",
  selected,
  defaultSelected,
  onSelectionChange,
  disallowEmptySelection = false,
  deselectOnClickAway = true,
  selectionFollowsFocus = true,
  onAction,
  allowTypeAhead = true,
  getSearchText,
  virtualized = false,
  scrollRef,
  overscan,
  noHeader = false,
  size = Size.Md,
  loop = false,
  resolveVisual = defaultResolveRowVisual as ResolveRowVisual<T>,
  className,
  ariaLabel,
  notFound,
}: ListGridProps<T>) {
  const order = useMemo(() => data.map(getRowId), [data, getRowId]);
  const itemById = useMemo(() => {
    const map = new Map<string, T>();
    data.forEach((item) => map.set(getRowId(item), item));
    return map;
  }, [data, getRowId]);
  const isDisabled = useCallback(
    (id: string) => {
      const item = itemById.get(id);
      return isRowDisabled !== undefined && item !== undefined && isRowDisabled(item);
    },
    [isRowDisabled, itemById],
  );
  const enabledIds = useMemo(
    () => (isRowDisabled ? order.filter((id) => !isDisabled(id)) : order),
    [order, isRowDisabled, isDisabled],
  );
  // Roving navigation reads disabledness from these indices rather than from each
  // row's `aria-disabled`, because a windowed list has no element for a row that is
  // scrolled out. `undefined` when nothing is disabled, which lets the composite fall
  // back to the attribute and keeps the common case allocation-free.
  const disabledIndices = useMemo(() => {
    if (!isRowDisabled) return undefined;
    const indices: number[] = [];
    order.forEach((id, index) => {
      if (isDisabled(id)) indices.push(index);
    });
    return indices;
  }, [order, isRowDisabled, isDisabled]);

  const selection = useTreeSelection({
    order,
    rangeMode: "replace",
    selected,
    defaultSelected,
    onSelectionChange,
  });

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Header hover (multiple mode): previews all rows as a group and, on click,
  // toggles select-all — the select-all affordance that replaces the checkbox.
  const [headerHovered, setHeaderHovered] = useState(false);
  // Clamp to range, then — if that row is disabled (e.g. the initial index 0 on
  // a disabled first row) — fall back to the first enabled row so the roving
  // tab-stop is always interactive.
  const safeIndex = useMemo(() => {
    if (order.length === 0) return 0;
    const clamped = Math.min(focusedIndex, order.length - 1);
    if (!isDisabled(order[clamped])) return clamped;
    const firstEnabled = order.findIndex((id) => !isDisabled(id));
    return firstEnabled >= 0 ? firstEnabled : clamped;
  }, [order, focusedIndex, isDisabled]);

  // Clicking outside the grid clears the selection (unless disallowed). The
  // grid element wraps every row + the header, so anything else is "away".
  const gridRef = useRef<HTMLDivElement>(null);
  useClickAway(gridRef, () => {
    if (deselectOnClickAway && !disallowEmptySelection && selectionMode !== "none")
      selection.clear();
  });

  const allEnabledSelected =
    enabledIds.length > 0 && enabledIds.every((id) => selection.isSelected(id));
  const toggleAll = useCallback(() => {
    if (allEnabledSelected) {
      // Honor disallowEmptySelection: when clearing is not allowed, select-all
      // stays a no-op rather than emptying the selection.
      if (!disallowEmptySelection) selection.clear();
    } else selection.setSelection(enabledIds, null);
  }, [allEnabledSelected, disallowEmptySelection, enabledIds, selection]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    order.forEach((id, i) => map.set(id, i));
    return map;
  }, [order]);
  const indexOfId = useCallback((id: string) => indexById.get(id) ?? -1, [indexById]);

  // Next enabled row index in a direction (matches the composite's disabled-
  // skipping + loop so focus and selection-follows-focus stay in sync).
  const nextEnabledIndex = useCallback(
    (from: number, dir: 1 | -1): number => {
      const n = order.length;
      if (n === 0) return 0;
      for (let step = 1; step <= n; step++) {
        let i = from + dir * step;
        if (loop) i = ((i % n) + n) % n;
        else if (i < 0 || i >= n) return from;
        const item = itemById.get(order[i]);
        if (!isRowDisabled || !item || !isRowDisabled(item)) return i;
      }
      return from;
    },
    [order, loop, isRowDisabled, itemById],
  );
  const edgeEnabledIndex = useCallback(
    (edge: "first" | "last"): number => {
      const ids = enabledIds;
      const id = edge === "first" ? ids[0] : ids[ids.length - 1];
      return id === undefined ? safeIndex : indexOfId(id);
    },
    [enabledIds, indexOfId, safeIndex],
  );

  const selectOnly = useCallback(
    (id: string) => {
      if (selectionMode === "none") return;
      selection.select(id); // replace gesture
    },
    [selectionMode, selection],
  );

  // Type-ahead — re-added at the controller layer (the composite has none).
  const queryRef = useRef("");
  const queryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const typeAhead = useCallback(
    (char: string) => {
      if (!allowTypeAhead) return;
      queryRef.current += char.toLowerCase();
      const match = enabledIds.find((id) => {
        const item = itemById.get(id);
        if (!item) return false;
        const text = getSearchText ? getSearchText(item) : id;
        return text.toLowerCase().startsWith(queryRef.current);
      });
      if (queryTimer.current) clearTimeout(queryTimer.current);
      queryTimer.current = setTimeout(() => (queryRef.current = ""), TYPE_AHEAD_RESET_MS);
      if (match !== undefined) setFocusedIndex(indexOfId(match));
    },
    [allowTypeAhead, enabledIds, itemById, getSearchText, indexOfId],
  );
  useEffect(() => () => clearTimeout(queryTimer.current), []);

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, id: string) => {
      // Keys from an in-row control (input/button/…) belong to that control, not
      // the list. Stop the composite's own navigation keys from bubbling out —
      // otherwise arrowing at a text boundary would rove focus out of the field
      // mid-edit (Base UI's combobox behavior). Escape/typing still bubble (so
      // Escape can exit the field back to its row). Our own row logic is skipped.
      if (event.target !== event.currentTarget) {
        if (COMPOSITE_NAV_KEYS.has(event.key)) event.stopPropagation();
        return;
      }
      if (isDisabled(id)) return;

      const mod = event.ctrlKey || event.metaKey;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          const dir = event.key === "ArrowDown" ? 1 : -1;
          const target = order[nextEnabledIndex(indexOfId(id), dir)];
          // Focus itself is moved by the composite; we layer selection on top.
          if (mod || selectionMode === "none" || !selectionFollowsFocus) break;
          if (event.shiftKey && selectionMode === "multiple")
            selection.select(target, { range: true });
          else selectOnly(target);
          break;
        }
        case "Home":
        case "End": {
          const target = order[edgeEnabledIndex(event.key === "Home" ? "first" : "last")];
          if (mod || selectionMode === "none" || !selectionFollowsFocus) break;
          if (event.shiftKey && selectionMode === "multiple")
            selection.select(target, { range: true });
          else selectOnly(target);
          break;
        }
        case " ":
          event.preventDefault();
          if (selectionMode === "none") onAction?.(id, event);
          else selection.select(id, { toggle: true });
          break;
        case "Enter":
          event.preventDefault();
          onAction?.(id, event);
          break;
        case "Escape":
          if (selectionMode !== "none" && !disallowEmptySelection) {
            event.preventDefault();
            selection.clear();
          }
          break;
        case "a":
          if (mod && selectionMode === "multiple") {
            event.preventDefault();
            selection.setSelection(enabledIds, null);
            break;
          }
          if (!mod && !event.altKey) typeAhead(event.key);
          break;
        default:
          if (event.key.length === 1 && !mod && !event.altKey) typeAhead(event.key);
          break;
      }
    },
    [
      order,
      nextEnabledIndex,
      edgeEnabledIndex,
      indexOfId,
      isDisabled,
      selectionMode,
      selectionFollowsFocus,
      selection,
      selectOnly,
      onAction,
      disallowEmptySelection,
      enabledIds,
      typeAhead,
    ],
  );

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLElement>, id: string) => {
      if (isDisabled(id)) return;
      // Clicks that originate in an interactive cell control must not select the
      // row (embedded buttons/menus/inputs keep working).
      if (
        (event.target as HTMLElement).closest(
          "button, input, select, textarea, [role='menuitem'], [role='menuitemradio'], [data-radix-collection-item]",
        )
      ) {
        return;
      }
      setFocusedIndex(indexOfId(id));
      if (selectionMode === "none") {
        onAction?.(id, event);
        return;
      }
      if (selectionMode === "single") {
        if (selection.isSelected(id) && !disallowEmptySelection) selection.clear();
        else selection.select(id);
        return;
      }
      // multiple
      if (event.shiftKey) selection.select(id, { range: true });
      else if (event.ctrlKey || event.metaKey) selection.select(id, { toggle: true });
      else if (selection.isSelected(id) && selection.selected.size === 1 && !disallowEmptySelection)
        selection.clear();
      else selection.select(id);
    },
    [indexOfId, isDisabled, selectionMode, selection, onAction, disallowEmptySelection],
  );

  // Which rows to render. Non-virtualized lists get the whole range, so the render
  // below has one shape rather than two.
  const rowWindow = useRowWindow({
    total: data.length,
    scrollRef: scrollRef ?? emptyScrollRef,
    estimatedRowHeight: ROW_HEIGHT_PX[size],
    overscan,
    // The keyboard cursor stays mounted, so roving focus can cross a window edge.
    pinnedIndex: safeIndex,
    enabled: virtualized && scrollRef !== undefined,
  });

  // Moving the cursor scrolls to it — what keyboard navigation, type-ahead and Home/End
  // all rely on when their target is outside the rendered slice.
  //
  // The reverse coupling is deliberately NOT an effect. Having the viewport pull the
  // cursor back whenever it scrolled away meant the two chased each other: a jump to row
  // 9999 scrolls, and in that same commit the window has not caught up yet, so the
  // cursor gets dragged back to the top. What the cursor-out-of-view case actually needs
  // is only that SOMETHING stays tabbable, which `tabStopIndex` below says declaratively.
  useEffect(() => {
    if (!virtualized) return;
    rowWindow.scrollToIndex(safeIndex);
    // Deliberately keyed on the cursor alone: re-running on window or scroll changes
    // would scroll during the user's own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, virtualized]);

  // Measured floors for the auto tracks, so a windowed list's columns stop resizing
  // as rows scroll past. See `ListGridProps.virtualized` for why this exists; the
  // short version is that `auto` means "as wide as the cells the browser can see",
  // and windowing changes which cells those are.
  const [trackFloors, setTrackFloors] = useState<number[]>([]);
  const gridWidthRef = useRef(0);

  // Column tracks: `1fr` for a flex column, else `auto`. A `hideBelow` column is
  // forced to `auto` regardless of `flex` — collapsing to 0 when hidden requires
  // an auto track; a `1fr` track would keep reserving width and leave a gap.
  //
  // A floor is expressed as `minmax(floor, auto)`, which keeps the track content-sized
  // while stopping it shrinking below what it has already been. A hidden column's floor
  // is 0 (its cells measure nothing), so `hideBelow` still collapses the track — and
  // the floors are discarded whenever the container's width changes, which is exactly
  // when hiding flips.
  const gridTemplateColumns = useMemo(
    () =>
      columns
        .map((c, i) => {
          if (c.width !== undefined) return c.width;
          const base = c.flex && !c.hideBelow ? "1fr" : "auto";
          const floors: string[] = [];
          if (c.minWidth !== undefined) floors.push(c.minWidth);
          const measured = trackFloors[i];
          if (measured !== undefined && measured > 0) floors.push(`${measured.toString()}px`);
          if (floors.length === 0) return base;
          const floor = floors.length === 1 ? floors[0] : `max(${floors.join(", ")})`;
          return `minmax(${floor}, ${base === "1fr" ? "1fr" : "auto"})`;
        })
        .join(" "),
    [columns, trackFloors],
  );

  // Read the used track widths and keep the high-water mark. Runs when the rendered
  // window moves (a wider cell can only appear with a new row) or the columns change,
  // and settles immediately: a floor raises a track's width, so the next read returns
  // the same number and the state update bails.
  useLayoutEffect(() => {
    if (!virtualized) return;
    const grid = gridRef.current;
    if (!grid) return;
    const used = getComputedStyle(grid)
      .gridTemplateColumns.split(" ")
      .map((value) => parseFloat(value));
    setTrackFloors((previous) => {
      let changed = false;
      const next = columns.map((column, i) => {
        // A fixed-width column has nothing to stabilize, and a flexible one is
        // already `1fr` — pinning a floor on it would stop it giving width back.
        if (column.width !== undefined || (column.flex && !column.hideBelow)) return 0;
        // `getComputedStyle` resolves to used pixel values only where the element is
        // really laid out as a grid; anything else (no stylesheet, `display:none`) parses
        // to NaN, which must not be recorded as a floor.
        const raw = used[i];
        const usedWidth = Number.isFinite(raw) ? raw : 0;
        const floor = previous[i] ?? 0;
        const grown = Math.max(floor, usedWidth);
        if (grown !== floor) changed = true;
        return grown;
      });
      return changed ? next : previous;
    });
  }, [virtualized, columns, rowWindow.start, rowWindow.end]);

  // A container-width change invalidates the floors: it is what flips `hideBelow`,
  // and a floor measured while a column was visible would otherwise hold width open
  // for a column that is now hidden.
  useLayoutEffect(() => {
    if (!virtualized) return;
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(() => {
      const width = grid.getBoundingClientRect().width;
      if (Math.abs(width - gridWidthRef.current) < 0.5) return;
      gridWidthRef.current = width;
      setTrackFloors((previous) => (previous.length === 0 ? previous : []));
    });
    observer.observe(grid);
    return () => {
      observer.disconnect();
    };
  }, [virtualized]);

  // New data can be narrower than the old, so the floors must not outlive it.
  useLayoutEffect(() => {
    setTrackFloors((previous) => (previous.length === 0 ? previous : []));
  }, [data]);

  const rowColumns = useMemo(
    () =>
      columns.map((c) => ({
        key: c.key,
        align: c.align,
        className: c.hideBelow ? HIDE_BELOW_CLASS[c.hideBelow] : undefined,
      })),
    [columns],
  );

  if (data.length === 0 && notFound !== undefined) {
    return <div className={className}>{notFound}</div>;
  }

  return (
    <TreeNavRoot
      role={selectionMode === "none" ? "grid" : "listbox"}
      ariaLabel={ariaLabel}
      className={className}
      highlightedIndex={safeIndex}
      onHighlightedIndexChange={setFocusedIndex}
      // The index space is the DATA's, not the rendered window's, so Home/End and
      // the arrow bounds mean the same thing whether or not this list is windowed.
      total={data.length}
      disabledIndices={disabledIndices}
      // With the cursor scrolled out of the window there is no cursor row to carry the
      // tab stop, so the first rendered row carries it and the list stays reachable by
      // Tab. Focusing it moves the cursor there, which is what the user meant.
      tabStopIndex={rowWindow.pinnedIndexInWindow ? safeIndex : rowWindow.start}
      loop={loop}
      // Keep roving focus moving while these are held so selection-follows-focus
      // (Shift = range, Cmd/Ctrl = focus-only) works on modified arrows; the
      // composite otherwise bails on any modifier.
      modifierKeys={["Shift", "Control", "Meta"]}
    >
      {/* `@container` makes column hiding respond to the grid's own width
          (container query), not the viewport — reliable and JS-free. */}
      <div
        ref={gridRef}
        className="@container grid"
        style={
          {
            gridTemplateColumns,
            // Scroll anchoring is actively harmful to a windowed list. The browser tries to
            // hold the visible content still when something ABOVE it changes size, and in a
            // windowed list the thing above is a spacer whose height changes by design every
            // time the window moves — so the browser "corrects" a scroll offset that was
            // already correct, and the list walks away from where the user left it. Measured
            // as a jump from 18,000px to 72,000px across a single window update.
            //
            // Excluded here rather than on the scroll container, which belongs to the
            // consumer: `overflow-anchor: none` on an element takes it and its descendants
            // out of anchor selection, and every row lives inside this one.
            overflowAnchor: "none",
          } as CSSProperties
        }
      >
        {!noHeader && (
          <div
            className={clsx(
              "col-span-full grid grid-cols-subgrid items-center border-b border-neutral-500/20",
              // Multiple mode: the header is the select-all affordance — hovering
              // previews every row (light emphasis), clicking toggles all.
              selectionMode === "multiple" && "cursor-pointer",
            )}
            role={selectionMode === "multiple" ? "button" : undefined}
            aria-label={selectionMode === "multiple" ? "Select all" : undefined}
            aria-pressed={selectionMode === "multiple" ? allEnabledSelected : undefined}
            tabIndex={selectionMode === "multiple" ? 0 : undefined}
            onMouseEnter={selectionMode === "multiple" ? () => setHeaderHovered(true) : undefined}
            onMouseLeave={selectionMode === "multiple" ? () => setHeaderHovered(false) : undefined}
            onClick={selectionMode === "multiple" ? toggleAll : undefined}
            onKeyDown={
              selectionMode === "multiple"
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleAll();
                    }
                  }
                : undefined
            }
          >
            {columns.map((column, i) => (
              <div
                key={column.key}
                className={clsx(
                  // px-2 matches the body cells so headers align with their column.
                  "px-2 py-1 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400",
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left",
                  column.hideBelow ? HIDE_BELOW_CLASS[column.hideBelow] : undefined,
                )}
                style={{ gridColumn: `${(i + 1).toString()} / span 1` } as CSSProperties}
              >
                {column.header}
              </div>
            ))}
          </div>
        )}

        {/* The rows above the window, as one empty grid row. A spacer rather than
            absolute positioning, because an absolutely-positioned grid item leaves the
            track sizing it would otherwise take part in — which for rows laid out on
            `grid-cols-subgrid` means losing column alignment entirely. Spacers keep
            every row in normal flow, so the subgrid is untouched and windowing costs
            nothing structurally. `aria-hidden` and no role: these stand in for rows
            rather than being any. */}
        {rowWindow.paddingTop > 0 && (
          <div aria-hidden className="col-span-full" style={{ height: rowWindow.paddingTop }} />
        )}

        {data.slice(rowWindow.start, rowWindow.end).map((item, offset) => {
          const index = rowWindow.start + offset;
          const id = getRowId(item);
          const selectedNow = selection.isSelected(id);
          const focusedNow = index === safeIndex;
          const visual = resolveVisual(
            {
              focused: focusedNow,
              selected: selectedNow,
              // Header hover previews the whole set at light (hover-level) emphasis.
              emphasized: hoveredId === id || headerHovered,
              anchor: selection.anchorId === id,
            },
            item,
          );
          const cells = columns.map((column) =>
            column.render(item, { focused: focusedNow, selected: selectedNow }),
          );
          return (
            <TreeNavItem
              key={id}
              index={index}
              role={selectionMode === "none" ? "row" : "option"}
              ariaSelected={selectionMode === "none" ? undefined : selectedNow}
              // What a reader is told about the list's size has to be the list, not
              // the window: with rows mounted only near the viewport, a screen reader
              // counting the DOM would announce "3 of 12" in a list of ten thousand.
              ariaSetSize={data.length}
              ariaPosInSet={index + 1}
              disabled={isDisabled(id)}
              className="col-span-full grid grid-cols-subgrid outline-none group/row"
              onKeyDown={(event) => handleRowKeyDown(event, id)}
              onClick={(event) => handleRowClick(event, id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId((cur) => (cur === id ? null : cur))}
            >
              {/* Keyboard focus indicator lives on the row (not this wrapper) so
                  it resolves the row's own `--accent-color` — matching the
                  selection bar/background instead of a fixed hue. An inset
                  `outline` (not a `ring`/box-shadow) so it paints above the
                  row's absolute background overlay rather than behind it. */}
              <ListRow
                // One row reports the real row height, which is what the window's
                // arithmetic runs on — `ROW_HEIGHT` is a `rem` class, so the px
                // estimate is only right at a 16px root font size.
                ref={offset === 0 ? rowWindow.measureRef : undefined}
                columns={rowColumns}
                cells={cells}
                visual={visual}
                size={size}
                className="group-focus-visible/row:outline group-focus-visible/row:outline-2 group-focus-visible/row:-outline-offset-2 group-focus-visible/row:outline-[var(--accent-color)]"
              />
            </TreeNavItem>
          );
        })}

        {rowWindow.paddingBottom > 0 && (
          <div aria-hidden className="col-span-full" style={{ height: rowWindow.paddingBottom }} />
        )}
      </div>
    </TreeNavRoot>
  );
}
