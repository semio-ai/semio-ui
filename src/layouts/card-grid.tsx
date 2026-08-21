import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import { useListState, type SelectionMode } from "../hooks/use-list-state";
import { GridNavItem, GridNavRoot } from "./use-grid-navigation";

/**
 * Controls whose clicks belong to themselves, not to the item containing them.
 *
 * Identical to the selector `ListGrid` uses, so an overflow menu or a footer
 * button behaves the same in a grid as in a table. Without it, every embedded
 * control would also change the selection.
 */
const INTERACTIVE_SELECTOR =
  "button, input, select, textarea, a, [role='menuitem'], [role='menuitemradio'], [data-radix-collection-item]";

/** State handed to the item renderer, so the consumer draws its own emphasis. */
export interface CardGridItemState {
  selected: boolean;
  /** The roving-focus target — the keyboard cursor, distinct from selection. */
  focused: boolean;
}

export interface CardGridProps<T> {
  data: T[];
  /** Stable id per item; the selection and focus key. */
  getItemId: (item: T) => string;
  /** Non-interactive items are skipped by navigation and cannot be selected. */
  isItemDisabled?: (item: T) => boolean;
  /**
   * Renders one item. `CardGrid` owns selection, focus and layout; what an item
   * *looks* like is entirely the consumer's — pass a `Card`, or anything else.
   */
  children: (item: T, state: CardGridItemState) => ReactNode;

  selectionMode?: SelectionMode;
  selected?: Iterable<string>;
  defaultSelected?: Iterable<string>;
  onSelectionChange?: (next: Set<string>) => void;
  disallowEmptySelection?: boolean;
  /** Clicking outside clears the selection. Defaults to true, as `ListGrid` does. */
  deselectOnClickAway?: boolean;
  /**
   * Arrow keys move selection along with focus (Finder-style). Defaults to true
   * for single/multiple, ignored for `none`. Hold Cmd/Ctrl to move focus only.
   */
  selectionFollowsFocus?: boolean;
  /** Activation: Enter always, and click when `selectionMode` is `none`. */
  onAction?: (id: string, event: ReactKeyboardEvent | ReactMouseEvent) => void;
  /**
   * A card was double-clicked. Optional, and named for the gesture rather than
   * for a meaning: what a second click *does* is the consumer's decision, not
   * the grid's. Pairs with a `selectionMode` where the first click selects —
   * with `none`, that click has already fired {@link onAction}.
   */
  onItemDoubleClick?: (id: string, event: ReactMouseEvent) => void;
  /** Wrap navigation from the last item to the first. */
  loop?: boolean;

  allowTypeAhead?: boolean;
  getSearchText?: (item: T) => string;

  ariaLabel?: string;
  /**
   * Grid classes, including the column count — `grid-cols-2 lg:grid-cols-4` and so
   * on. Layout stays the consumer's; the column count for *navigation* is measured
   * from the rendered result rather than declared twice.
   */
  className?: string;
  /**
   * Where the grid's LEFTOVER width goes, when the tracks do not fill the row.
   *
   * Only meaningful with fixed-width tracks. Tracks declared as `1fr` absorb every
   * spare pixel themselves, so there is no free space left to justify and this does
   * nothing — which is the arrangement most consumers start from.
   *
   * It exists because the answer is a matter of taste rather than of correctness,
   * and the taste differs per surface: `start` keeps the first card aligned with
   * whatever heading sits above the grid, `center` looks tidier in isolation but
   * breaks that alignment, and `space-between` reads well at three or four columns
   * and badly at two, where the cards fly to opposite edges. Parameterised so a
   * consumer can try them against real content instead of arguing from a mockup.
   */
  justify?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
  /**
   * Inline styles for the grid container. Mostly for callers that set their tracks
   * without utility classes — including tests, which run without the compiled
   * stylesheet and would otherwise measure no columns at all.
   *
   * Applied AFTER {@link justify}, so a caller that sets `justifyContent` here
   * still wins.
   */
  style?: CSSProperties;
}

/**
 * A selectable, keyboard-navigable grid of arbitrary items.
 *
 * This is to a card layout what `ListGrid` is to a table: the same selection core
 * (`useListState`), a different navigation adapter. Roving focus, arrow handling,
 * Home/End, disabled skipping and scroll-into-view all belong to `GridNavRoot` /
 * `GridNavItem` over Base UI's composite — this component adds only what is
 * specific to a *selectable* grid: selection gestures, activation, type-ahead, and
 * the guard that stops an embedded button from changing the selection.
 *
 * **The column count is measured, not declared.** Consumers set columns with
 * responsive classes, so the number in effect depends on the container's width at
 * the moment a key is pressed. Reading it back from the resolved
 * `grid-template-columns` and handing it to the composite as `cols` keeps vertical
 * navigation correct at every breakpoint, with no prop that could silently
 * disagree with the CSS.
 */
export function CardGrid<T>({
  data,
  getItemId,
  isItemDisabled,
  children,
  selectionMode = "none",
  selected,
  defaultSelected,
  onSelectionChange,
  disallowEmptySelection = false,
  deselectOnClickAway = true,
  selectionFollowsFocus = true,
  onAction,
  onItemDoubleClick,
  loop = false,
  allowTypeAhead = true,
  getSearchText,
  ariaLabel,
  className,
  justify,
  style,
}: CardGridProps<T>) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  // `useListState` wants items keyed for it; keep the mapping local so consumers
  // are not forced to reshape their data.
  const listItems = useMemo(
    () =>
      data.map((item) => ({
        key: getItemId(item),
        disabled: isItemDisabled?.(item) ?? false,
      })),
    [data, getItemId, isItemDisabled],
  );

  const searchTextByKey = useMemo(() => {
    if (!getSearchText) return undefined;
    const map = new Map<string, string>();
    for (const item of data) map.set(getItemId(item), getSearchText(item));
    return map;
  }, [data, getItemId, getSearchText]);

  const state = useListState({
    items: listItems,
    selectionMode,
    selectedKeys: selected === undefined ? undefined : new Set(selected),
    defaultSelectedKeys: defaultSelected === undefined ? undefined : new Set(defaultSelected),
    onSelectionChange,
    disallowEmptySelection,
    allowTypeAhead,
    getSearchText: searchTextByKey
      ? (item) => searchTextByKey.get(item.key) ?? item.key
      : undefined,
  });

  // No measured column count, and no `ResizeObserver` to keep one current.
  //
  // Up/Down used to be the composite's, given `cols` — a number that exists
  // nowhere in CSS, so it had to be read back out of the resolved
  // `grid-template-columns` on every resize and handed in. `GridNavRoot` now
  // resolves the vertical axis from the rendered geometry instead, which cannot
  // disagree with what is on screen and needs nothing observed.
  //
  // It also moves out of a PARTIAL last row, which the arithmetic could not: with
  // four columns and six items there is no `index + cols` below the fourth card, so
  // Down simply did nothing.

  // The composite drives focus by INDEX; selection is keyed by id. These two
  // conversions are the whole seam between them.
  const ids = useMemo(() => listItems.map((item) => item.key), [listItems]);
  const highlightedIndex = useMemo(() => {
    const index = state.focusedKey === null ? -1 : ids.indexOf(state.focusedKey);
    return index === -1 ? 0 : index;
  }, [ids, state.focusedKey]);

  /**
   * What moved the roving cursor. `onHighlightedIndexChange` reports the new index
   * but not its cause, and the cause decides whether selection should follow:
   *
   * - keyboard, no modifier → follow (Finder-style browsing)
   * - keyboard with Cmd/Ctrl → focus only, selection untouched
   * - pointer → do nothing here; `handleClick` owns click selection, and it is the
   *   only path that respects the embedded-control guard
   *
   * Recorded on React CAPTURE props, on the outermost element, so it is set before
   * anything else in this tree sees the event.
   *
   * React props rather than native listeners, and that is not a style choice. React
   * delegates every handler to the ROOT container, so its capture phase runs above
   * the whole subtree — a React capture prop anywhere inside beats a NATIVE capture
   * listener attached to an element higher up. These were native listeners on this
   * element, and `GridNavRoot`'s own React capture handler (which resolves Up/Down)
   * therefore ran first and read a flag still describing the previous click:
   * arrowing reported `pointer: true` and selection stopped following focus.
   *
   * As React props on an ancestor, ordinary top-down capture ordering applies and
   * this runs first again.
   */
  const navSource = useRef<{ pointer: boolean; focusOnly: boolean }>({
    pointer: false,
    focusOnly: false,
  });
  const handleHighlightChange = useCallback(
    (index: number) => {
      const id = ids[index];
      if (id === undefined) return;
      state.setFocusedKey(id);
      const { pointer, focusOnly } = navSource.current;
      if (pointer || focusOnly) return;
      if (selectionFollowsFocus && selectionMode !== "none" && !state.isDisabled(id)) {
        state.select(id);
      }
    },
    [ids, state, selectionFollowsFocus, selectionMode],
  );

  // Only the keys the composite does not own: activation, toggle, clear. Arrows
  // and Home/End are handled upstream, which is the point of the adapter.
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const id = ids[highlightedIndex];
      if (id === undefined || state.isDisabled(id)) return;
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          onAction?.(id, event);
          break;
        case " ":
          event.preventDefault();
          if (selectionMode === "none") onAction?.(id, event);
          else state.toggle(id);
          break;
        case "Escape":
          if (selectionMode !== "none" && !disallowEmptySelection) {
            event.preventDefault();
            state.clearSelection();
          }
          break;
        default:
          // Type-ahead lives in the shared hook; hand it anything unclaimed.
          if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
            state.handleItemKeyDown(id, event as unknown as KeyboardEvent);
          }
          break;
      }
    },
    [ids, highlightedIndex, state, onAction, selectionMode, disallowEmptySelection],
  );

  /**
   * Click selection is spelled out here rather than delegated to
   * `useListState.handleItemClick`, because in a grid the two paths collide.
   *
   * The composite moves roving focus on pointer-down, which fires
   * `handleHighlightChange` and — with selection following focus — selects the item
   * *before* the click handler runs. `handleItemClick` then sees it as already
   * selected and applies its toggle, clearing it. The net effect of a plain click
   * was an empty selection.
   *
   * So: a click always SELECTS, never toggles. That also makes the grid sticky by
   * default, which is what a click-to-preview surface wants — `Escape` clears, and
   * `multiple` mode keeps Cmd/Shift for additive gestures.
   */
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>, id: string) => {
      if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
      if (state.isDisabled(id)) return;

      if (selectionMode === "none") {
        // `onAction` is this component's, not the hook's — the hook was never
        // given one, so delegating here would silently do nothing.
        onAction?.(id, event);
        return;
      }
      if (selectionMode === "single") {
        state.select(id);
        return;
      }
      if (event.shiftKey) state.selectRange(state.focusedKey ?? id, id);
      else if (event.metaKey || event.ctrlKey) state.toggle(id);
      // A plain click REPLACES the selection. `select` adds in `multiple` mode, and
      // a range of one is the only replace-with-a-single-item primitive the hook
      // exposes here — clearing first would emit two changes.
      else state.selectRange(id, id);
    },
    [state, selectionMode, onAction],
  );

  // ── Click-away ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!deselectOnClickAway || selectionMode === "none" || disallowEmptySelection) return;
    const onPointerDown = (event: PointerEvent) => {
      const grid = gridRef.current;
      if (grid && !grid.contains(event.target as Node)) state.clearSelection();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [deselectOnClickAway, selectionMode, disallowEmptySelection, state]);

  return (
    <div
      ref={gridRef}
      onKeyDownCapture={(event) => {
        navSource.current = { pointer: false, focusOnly: event.metaKey || event.ctrlKey };
      }}
      onPointerDownCapture={() => {
        navSource.current = { pointer: true, focusOnly: false };
      }}
      className={clsx("grid", className)}
      style={{ justifyContent: justify, ...style }}
    >
      <GridNavRoot
        highlightedIndex={highlightedIndex}
        onHighlightedIndexChange={handleHighlightChange}
        loop={loop}
        // Keep roving focus moving while these are held, so Cmd+Arrow (focus only)
        // and Shift+Arrow work; the composite otherwise bails on any modifier.
        modifierKeys={["Shift", "Control", "Meta"]}
        role={selectionMode === "none" ? "grid" : "listbox"}
        ariaLabel={ariaLabel}
        ariaMultiselectable={selectionMode === "multiple" ? true : undefined}
        onKeyDown={handleKeyDown}
        // `display: contents` so the items are the grid container's direct children
        // and the measured tracks describe the cards, not a single wrapper.
        className="contents"
      >
        {data.map((item) => {
          const id = getItemId(item);
          const disabled = isItemDisabled?.(item) ?? false;
          return (
            <GridNavItem
              key={id}
              role={selectionMode === "none" ? "gridcell" : "option"}
              ariaSelected={selectionMode === "none" ? undefined : state.isSelected(id)}
              disabled={disabled}
              onClick={disabled ? undefined : (event) => handleClick(event, id)}
              onDoubleClick={
                disabled || !onItemDoubleClick
                  ? undefined
                  : (event) => {
                      // The SAME exclusion `handleClick` applies, for the same reason.
                      // A card carries three verbs — background selects, the image
                      // inspects, the title navigates — and they stay separate only
                      // because clicks originating in a link or a button are not the
                      // card's clicks. The single-click path guarded that and this one
                      // did not, so double-clicking a title link fired navigation AND
                      // inspection: exactly the conflation the split exists to prevent.
                      if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
                      onItemDoubleClick(id, event);
                    }
              }
              // The focus ring belongs to the card the consumer renders, not to
              // this wrapper, so the wrapper suppresses its own.
              className="focus-visible:outline-hidden"
            >
              {children(item, {
                selected: state.isSelected(id),
                focused: ids[highlightedIndex] === id,
              })}
            </GridNavItem>
          );
        })}
      </GridNavRoot>
    </div>
  );
}
