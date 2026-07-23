import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { Size } from "../types";
import { useClickAway } from "../hooks/use-click-away";
import { defaultResolveRowVisual, type ResolveRowVisual } from "../tree/resolve-row-visual";
import { TreeNavItem, TreeNavRoot } from "../tree/use-tree-navigation";
import { useTreeSelection } from "../tree/use-tree-selection";
import { ListRow } from "./list-row";

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

  noHeader?: boolean;
  size?: Size;
  loop?: boolean;
  resolveVisual?: ResolveRowVisual<T>;
  className?: string;
  ariaLabel?: string;
  notFound?: ReactNode;
}

const TYPE_AHEAD_RESET_MS = 1000;

/** The keys the Base-UI composite treats as roving navigation. When they come
 *  from an in-row control we stop their propagation so focus never roves out of
 *  a field mid-edit. */
const COMPOSITE_NAV_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"]);

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
    if (deselectOnClickAway && !disallowEmptySelection && selectionMode !== "none") selection.clear();
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
          if (event.shiftKey && selectionMode === "multiple") selection.select(target, { range: true });
          else selectOnly(target);
          break;
        }
        case "Home":
        case "End": {
          const target = order[edgeEnabledIndex(event.key === "Home" ? "first" : "last")];
          if (mod || selectionMode === "none" || !selectionFollowsFocus) break;
          if (event.shiftKey && selectionMode === "multiple") selection.select(target, { range: true });
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

  // Column tracks: `1fr` for a flex column, else `auto`. A `hideBelow` column is
  // forced to `auto` regardless of `flex` — collapsing to 0 when hidden requires
  // an auto track; a `1fr` track would keep reserving width and leave a gap.
  const gridTemplateColumns = useMemo(
    () => columns.map((c) => (c.flex && !c.hideBelow ? "1fr" : "auto")).join(" "),
    [columns],
  );
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
      loop={loop}
      // Keep roving focus moving while these are held so selection-follows-focus
      // (Shift = range, Cmd/Ctrl = focus-only) works on modified arrows; the
      // composite otherwise bails on any modifier.
      modifierKeys={["Shift", "Control", "Meta"]}
    >
      {/* `@container` makes column hiding respond to the grid's own width
          (container query), not the viewport — reliable and JS-free. */}
      <div ref={gridRef} className="@container grid" style={{ gridTemplateColumns } as CSSProperties}>
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
                  column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left",
                  column.hideBelow ? HIDE_BELOW_CLASS[column.hideBelow] : undefined,
                )}
                style={{ gridColumn: `${(i + 1).toString()} / span 1` } as CSSProperties}
              >
                {column.header}
              </div>
            ))}
          </div>
        )}

        {data.map((item, index) => {
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
              role={selectionMode === "none" ? "row" : "option"}
              ariaSelected={selectionMode === "none" ? undefined : selectedNow}
              disabled={isDisabled(id)}
              className="col-span-full grid grid-cols-subgrid outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              onKeyDown={(event) => handleRowKeyDown(event, id)}
              onClick={(event) => handleRowClick(event, id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId((cur) => (cur === id ? null : cur))}
            >
              <ListRow columns={rowColumns} cells={cells} visual={visual} size={size} />
            </TreeNavItem>
          );
        })}
      </div>
    </TreeNavRoot>
  );
}
