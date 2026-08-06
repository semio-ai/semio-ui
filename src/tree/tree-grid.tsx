import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRowWindow } from "../hooks/use-row-window";
import { flattenTree, type FlatTreeRow, type TreeNode } from "./flatten-tree";
import { useCollapsibleTree } from "./use-collapsible-tree";
import { useTreeSelection } from "./use-tree-selection";
import { defaultResolveRowVisual, type ResolveRowVisual } from "./resolve-row-visual";
import { TreeRow } from "./tree-row";
import { TreeToggle } from "./tree-toggle";
import { TreeLeafDot } from "./tree-indent";
import { TreeNavItem, TreeNavRoot } from "./use-tree-navigation";

const DEFAULT_LEAF_ICON = <TreeLeafDot />;

/**
 * `TreeRow`'s `h-9` in px, for the first paint of a windowed tree — before a real row
 * exists to measure. An estimate resolved at a 16px root font size; `useRowWindow`
 * measures a mounted row and corrects itself.
 */
const TREE_ROW_HEIGHT_PX = 36;

/** Stand-in for a caller that passed no `scrollRef`; only read while windowing is off. */
const emptyScrollRef: RefObject<HTMLElement | null> = { current: null };

export interface TreeGridProps<T> {
  /** The tree to render. */
  nodes: TreeNode<T>[];
  /** Row label content (name / editable field). */
  getLabel: (row: FlatTreeRow<T>) => ReactNode;
  /** Optional value editor for a row (leaf, or a group with an aggregate control). */
  getEditor?: (row: FlatTreeRow<T>) => ReactNode;
  /** Optional trailing actions for a row. */
  getActions?: (row: FlatTreeRow<T>) => ReactNode;
  /**
   * Icon for a leaf row (groups get an expand toggle automatically). Return
   * `undefined` to fall back to {@link TreeGridProps.defaultLeafIcon}; return
   * `null` to give that specific row no icon.
   */
  getLeafIcon?: (row: FlatTreeRow<T>) => ReactNode;
  /**
   * Fallback icon for leaf rows whose `getLeafIcon` is absent or returns
   * `undefined`, so the icon column stays visually consistent next to group
   * chevrons. Defaults to a small dot; pass `null` for bare, icon-less labels.
   */
  defaultLeafIcon?: ReactNode;
  /** Interaction-state → styling; defaults to a neutral resolver. */
  resolveVisual?: ResolveRowVisual<T>;

  // Collapse (controlled/uncontrolled) — see useCollapsibleTree.
  collapsed?: Iterable<string>;
  defaultCollapsed?: Iterable<string>;
  onCollapsedChange?: (next: Set<string>) => void;

  // Selection (controlled/uncontrolled) — see useTreeSelection.
  selected?: Iterable<string>;
  defaultSelected?: Iterable<string>;
  onSelectionChange?: (next: Set<string>) => void;
  scopeOf?: (id: string) => string | undefined;
  onScopeChange?: (scope: string | undefined) => void;
  /** When true, selecting a group selects its whole subtree. */
  selectGroupDescendants?: boolean;

  /**
   * Indentation guide-line style:
   * - `"full"` (default) — a vertical rule in every indentation column, matching
   *   the animation package's track-list look.
   * - `"last-child"` — standard file-tree connectors that omit the continuation
   *   line below an ancestor that is its parent's last child.
   */
  guideLines?: "full" | "last-child";
  /** Roving focus wraps at the ends. */
  loop?: boolean;
  /**
   * Render only the rows near the viewport instead of every visible row.
   *
   * A tree windows exactly as a flat list does, because `flattenTree` has already
   * turned the hierarchy into an array: the rows currently on screen are a slice of
   * that array, and collapsing a group simply makes it shorter. Indentation and guide
   * lines are per-row properties, so they survive windowing untouched.
   *
   * Requires {@link TreeGridProps.scrollRef}. Rows are a fixed height (`TreeRow` is
   * `h-9`), so this needs no per-row measurement.
   */
  virtualized?: boolean;
  /**
   * The element that scrolls, required by {@link TreeGridProps.virtualized}. For a
   * tree inside a `ScrollArea`, this is that component's `viewportRef`.
   */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Rows rendered beyond each edge of the viewport. Defaults to 6. */
  overscan?: number;
  slotWidth?: number;
  className?: string;
  /** Accessible name for the tree container. */
  ariaLabel?: string;
}

/** Build a group-id → descendant-ids map for selection propagation. */
function collectDescendants<T>(nodes: TreeNode<T>[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const walk = (node: TreeNode<T>): string[] => {
    const out: string[] = [];
    for (const child of node.children ?? []) {
      out.push(child.id, ...walk(child));
    }
    map.set(node.id, out);
    return out;
  };
  nodes.forEach(walk);
  return map;
}

/** First focusable descendant of a row, for edit-mode entry. */
function firstFocusable(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(
    'input, textarea, select, button, [role="slider"], [tabindex]:not([tabindex="-1"])',
  );
}

/**
 * Batteries-included hierarchical, collapsible, selectable, keyboard-navigable
 * row list. Composes `flattenTree` + `useCollapsibleTree` + `useTreeSelection`
 * + the Base-UI roving-focus adapter + `TreeRow`. Consumers inject row content
 * (label/editor/actions) and, optionally, a visual resolver and selection
 * policy; everything else — nesting, collapse, focus, keyboard, selection
 * mechanics, and the bar/background rendering — is handled here.
 *
 * Keyboard: Up/Down/Home/End move focus (Base UI composite); Left/Right
 * collapse/expand the focused group; Space selects (Shift = range, Ctrl/Cmd =
 * toggle); Enter enters the row's first control (edit mode); Escape returns
 * focus to the row.
 *
 * ## Scale
 *
 * **Renders every visible row by default — it is not windowed unless you ask.** A
 * collapsed group costs nothing, but an expanded tree of thousands of rows renders all of
 * them. Pass {@link TreeGridProps.virtualized} with a {@link TreeGridProps.scrollRef} to
 * render only the rows near the viewport; `flattenTree` already produces the array that
 * makes this ordinary, and `useRowWindow` is exported for a consumer composing the row
 * primitives directly rather than using this component.
 */
export function TreeGrid<T>({
  nodes,
  getLabel,
  getEditor,
  getActions,
  getLeafIcon,
  defaultLeafIcon = DEFAULT_LEAF_ICON,
  resolveVisual = defaultResolveRowVisual as ResolveRowVisual<T>,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  selected,
  defaultSelected,
  onSelectionChange,
  scopeOf,
  onScopeChange,
  selectGroupDescendants = false,
  guideLines = "full",
  loop = false,
  virtualized = false,
  scrollRef,
  overscan,
  slotWidth,
  className,
  ariaLabel,
}: TreeGridProps<T>) {
  const collapse = useCollapsibleTree({ collapsed, defaultCollapsed, onCollapsedChange });

  // Depend on the stable `isCollapsed` callback, not the whole controller
  // object (which is a new reference each render), so this only re-flattens
  // when the tree or collapse state actually changes.
  const isCollapsed = collapse.isCollapsed;
  const rows = useMemo(() => flattenTree(nodes, { isCollapsed }), [nodes, isCollapsed]);
  const order = useMemo(() => rows.map((r) => r.id), [rows]);

  const descendants = useMemo(
    () => (selectGroupDescendants ? collectDescendants(nodes) : null),
    [nodes, selectGroupDescendants],
  );
  const getDescendants = useMemo(
    () => (descendants ? (id: string) => descendants.get(id) ?? [] : undefined),
    [descendants],
  );

  const selection = useTreeSelection({
    order,
    selected,
    defaultSelected,
    onSelectionChange,
    scopeOf,
    onScopeChange,
    getDescendants,
  });

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const safeIndex = order.length === 0 ? 0 : Math.min(focusedIndex, order.length - 1);

  // Which of the flattened rows to render. Collapsing a group shortens `rows`, so the
  // total is simply its length — no separate accounting of what is expanded.
  const rowWindow = useRowWindow({
    total: rows.length,
    scrollRef: scrollRef ?? emptyScrollRef,
    estimatedRowHeight: TREE_ROW_HEIGHT_PX,
    overscan,
    // Keeps the keyboard cursor mounted so roving focus can cross a window edge.
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

  // O(1) id → index lookups (used per keystroke / click), instead of an
  // O(n) `order.indexOf` each time.
  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    order.forEach((id, i) => map.set(id, i));
    return map;
  }, [order]);
  const indexOfId = useCallback((id: string) => indexById.get(id) ?? -1, [indexById]);

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, row: FlatTreeRow<T>) => {
      // Keys typed inside a cell editor bubble through the row wrapper; ignore
      // them here so editing isn't hijacked by tree navigation.
      if (event.target !== event.currentTarget) return;

      switch (event.key) {
        case "ArrowRight":
          if (row.isGroup && collapse.isCollapsed(row.id)) {
            event.preventDefault();
            collapse.setCollapsed(row.id, false);
          } else if (row.isGroup) {
            event.preventDefault();
            setFocusedIndex(Math.min(indexOfId(row.id) + 1, order.length - 1));
          }
          break;
        case "ArrowLeft":
          if (row.isGroup && !collapse.isCollapsed(row.id)) {
            event.preventDefault();
            collapse.setCollapsed(row.id, true);
          } else if (row.depth > 0) {
            // Move focus to the nearest shallower ancestor row.
            event.preventDefault();
            for (let i = indexOfId(row.id) - 1; i >= 0; i--) {
              if (rows[i].depth < row.depth) {
                setFocusedIndex(i);
                break;
              }
            }
          }
          break;
        case " ":
          event.preventDefault();
          selection.select(row.id, {
            toggle: event.ctrlKey || event.metaKey,
            range: event.shiftKey,
          });
          break;
        case "Enter": {
          const control = firstFocusable(event.currentTarget);
          if (control) {
            event.preventDefault();
            control.focus();
          }
          break;
        }
        default:
          break;
      }
    },
    [collapse, indexOfId, order.length, rows, selection],
  );

  const handleRootKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    // Escape from within a cell editor returns focus to its row.
    if (event.key === "Escape") {
      const row = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
      if (row && row !== event.target) {
        event.preventDefault();
        row.focus();
      }
    }
  }, []);

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLElement>, row: FlatTreeRow<T>) => {
      setFocusedIndex(indexOfId(row.id));
      selection.select(row.id, {
        toggle: event.ctrlKey || event.metaKey,
        range: event.shiftKey,
      });
    },
    [indexOfId, selection],
  );

  return (
    <TreeNavRoot
      role="tree"
      ariaLabel={ariaLabel}
      className={className}
      highlightedIndex={safeIndex}
      // The index space is the flattened row list's, so Home/End reach the real ends
      // of the tree whether or not it is windowed.
      total={rows.length}
      // See `ListGrid`: keeps the list tabbable when the cursor is scrolled out.
      tabStopIndex={rowWindow.pinnedIndexInWindow ? safeIndex : rowWindow.start}
      onHighlightedIndexChange={setFocusedIndex}
      onKeyDown={handleRootKeyDown}
      loop={loop}
    >
      {/* Stands in for the rows above the window. See the note in `ListGrid`: a spacer
          rather than absolute positioning, so rows stay in normal flow. */}
      {rowWindow.paddingTop > 0 && <div aria-hidden style={{ height: rowWindow.paddingTop }} />}

      {rows.slice(rowWindow.start, rowWindow.end).map((row, offset) => {
        const index = rowWindow.start + offset;
        const selectedNow = selection.isSelected(row.id);
        const visual = resolveVisual(
          {
            focused: index === safeIndex,
            selected: selectedNow,
            emphasized: hoveredId === row.id,
            anchor: selection.anchorId === row.id,
          },
          row.data,
        );
        let icon: ReactNode;
        if (row.isGroup) {
          icon = (
            <TreeToggle
              expanded={row.expanded}
              ariaLabel={row.expanded ? "Collapse" : "Expand"}
              onToggle={() => collapse.toggle(row.id)}
            />
          );
        } else {
          const provided = getLeafIcon?.(row);
          icon = provided !== undefined ? provided : defaultLeafIcon;
        }

        return (
          <TreeNavItem
            key={row.id}
            index={index}
            ariaLevel={row.depth + 1}
            ariaExpanded={row.isGroup ? row.expanded : undefined}
            ariaSelected={selectedNow}
            className="outline-none group/row"
            onKeyDown={(event) => handleRowKeyDown(event, row)}
            onClick={(event) => handleRowClick(event, row)}
            onMouseEnter={() => setHoveredId(row.id)}
            onMouseLeave={() => setHoveredId((current) => (current === row.id ? null : current))}
          >
            {/* Keyboard focus indicator lives on the row (not this wrapper) so
                it resolves the row's own `--accent-color` — matching the
                selection bar/background instead of a fixed hue. An inset
                `outline` (not a `ring`/box-shadow) so it paints above the row's
                absolute background overlay rather than behind it. */}
            <TreeRow
              // One row reports the real height the window's arithmetic runs on;
              // `h-9` is a `rem` value, so the px estimate is root-font-size dependent.
              ref={offset === 0 ? rowWindow.measureRef : undefined}
              depth={row.depth}
              ancestorIsLast={guideLines === "last-child" ? row.ancestorIsLast : undefined}
              slotWidth={slotWidth}
              icon={icon}
              label={getLabel(row)}
              editor={getEditor?.(row)}
              actions={getActions?.(row)}
              visual={visual}
              className="rounded-xs group-focus-visible/row:outline group-focus-visible/row:outline-2 group-focus-visible/row:-outline-offset-2 group-focus-visible/row:outline-[var(--accent-color)]"
            />
          </TreeNavItem>
        );
      })}

      {rowWindow.paddingBottom > 0 && (
        <div aria-hidden style={{ height: rowWindow.paddingBottom }} />
      )}
    </TreeNavRoot>
  );
}
