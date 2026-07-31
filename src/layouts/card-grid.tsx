import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
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
  loop = false,
  allowTypeAhead = true,
  getSearchText,
  ariaLabel,
  className,
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

  // ── Measured column count, handed to the composite as `cols` ──────────────
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      // `grid-template-columns` resolves to a list of used track sizes, so its
      // length is the live column count at the current breakpoint.
      const tracks = getComputedStyle(grid).gridTemplateColumns.trim();
      setColumns(tracks && tracks !== "none" ? tracks.split(/\s+/).length : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  // The composite drives focus by INDEX; selection is keyed by id. These two
  // conversions are the whole seam between them.
  const ids = useMemo(() => listItems.map((item) => item.key), [listItems]);
  const highlightedIndex = useMemo(() => {
    const index = state.focusedKey === null ? -1 : ids.indexOf(state.focusedKey);
    return index === -1 ? 0 : index;
  }, [ids, state.focusedKey]);

  const handleHighlightChange = useCallback(
    (index: number) => {
      const id = ids[index];
      if (id === undefined) return;
      state.setFocusedKey(id);
      // Selection follows focus unless the viewer is explicitly browsing
      // (Cmd/Ctrl+Arrow), which the composite still navigates under because
      // `modifierKeys` lists those modifiers.
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

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>, id: string) => {
      if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
      state.handleItemClick(id, event as unknown as MouseEvent);
    },
    [state],
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
    <div ref={gridRef} className={clsx("grid", className)}>
      <GridNavRoot
        highlightedIndex={highlightedIndex}
        onHighlightedIndexChange={handleHighlightChange}
        cols={columns}
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
