import {
  type ReactNode,
  type RefObject,
  useRef,
  useEffect,
  useMemo,
  memo,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { clsx } from "clsx";
import useMeasure from "react-use-measure";
import { mergeRefs } from "react-merge-refs";
import { IconPointFilled } from "@tabler/icons-react";
import { useClickAway } from "../hooks/use-click-away";
import {
  useListState,
  type ListItem,
  type SelectionMode,
} from "../hooks/use-list-state";
import { Size, Variant } from "../types";
import { Checkbox } from "../inputs/checkbox";
import { ToggleSquare } from "../inputs/toggle-square";
import { ICON_CLASS_NAME } from "../constants/icon";

/**
 * Defines the structure and behavior of a table column.
 *
 * @template T - The type of table list items
 * @property key - Unique identifier for the column, used for grid areas
 * @property header - Content to display in the column header
 * @property align - Text alignment within the column. Defaults to "left"
 * @property flex - Whether the column should grow to fill available space
 * @property requiredSize - Minimum screen size required to show this column
 * @property render - Function to render the cell content for each row
 */
export interface ColumnDefinition<T extends ListItem> {
  key: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  flex?: boolean;
  requiredSize?: Size;
  render: (value: T, elementFocused: boolean, elementSelected: boolean) => ReactNode;
}

/**
 * Props for the TableList component.
 *
 * @template T - The type of table list items extending ListItem
 * @property data - Array of data items to display in the table
 * @property columns - Column definitions that specify how to render each column
 * @property headerOffset - Offset from top for sticky header positioning. Defaults to 0
 * @property noHeader - Whether to hide the header row. Defaults to false
 * @property rowClassName - Additional CSS class for table rows
 * @property fullWidth - Whether the table should take full width. Defaults to false
 * @property headerClassName - Additional CSS class for the header
 * @property backgroundClassName - Additional CSS class for the table background
 * @property notFound - Content to show when no data is available
 * @property size - Size variant for the table rows and header. Defaults to Size.Md
 * @property variant - Visual variant for styling. Defaults to Variant.Default
 * @property selectionMode - Selection mode: "none", "single", or "multiple". Defaults to "none"
 * @property selectedKeys - Currently selected item keys (controlled mode)
 * @property onSelectionChange - Callback when selection changes (controlled mode)
 * @property defaultSelectedKeys - Default selected keys for uncontrolled mode
 * @property focusedKey - Currently focused item key (controlled mode)
 * @property onFocusChange - Callback when focus changes (controlled mode)
 * @property defaultFocusedKey - Default focused key for uncontrolled mode
 * @property disallowEmptySelection - Whether to prevent clearing all selections. Defaults to false
 * @property allowTypeAhead - Enable type-ahead search functionality. Defaults to true
 * @property allowWrapNavigation - Allow wrapping navigation at list boundaries. Defaults to true
 * @property getSearchText - Custom function to extract search text from items
 * @property onAction - Callback for item activation (Enter key or double-click equivalent)
 * @property onKeyDown - Custom keydown handler for items
 * @property transparentHeader - Whether the header should have a transparent background. Defaults to true
 * @property showIndicators - Whether to show selection indicators (radio/checkbox) in first column. Defaults to false
 */
/**
 * Appearance presets for common styling patterns.
 *
 * - `card`: Default — header, card-panel background, full padding. Used in dashboard.
 * - `panel`: Transparent background, subtle hover, no header, compact. Used in sidebars and modals.
 * - `inline`: Minimal styling, transparent, no padding. Used for embedded lists.
 */
export type TableListAppearance = "card" | "panel" | "inline";

export interface TableListProps<T extends ListItem> {
  data: T[];
  columns: ColumnDefinition<T>[];
  headerOffset?: number;
  noHeader?: boolean;
  rowClassName?: string;
  fullWidth?: boolean;
  headerClassName?: string;
  backgroundClassName?: string;
  notFound?: ReactNode;

  // Visual Config
  size?: Size;
  variant?: Variant;
  appearance?: TableListAppearance;

  // Selection configuration
  selectionMode?: SelectionMode;

  // Selection state (controlled)
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;

  // Selection state (uncontrolled)
  defaultSelectedKeys?: Set<string>;

  // Focus state
  focusedKey?: string | null;
  onFocusChange?: (key: string | null) => void;
  defaultFocusedKey?: string | null;

  // Selection constraints
  disallowEmptySelection?: boolean;
  deselectOnClickAway?: boolean;

  // Navigation options
  allowTypeAhead?: boolean;
  allowWrapNavigation?: boolean;
  getSearchText?: (item: T) => string;

  // Event handlers
  onAction?: (key: string, event: KeyboardEvent | MouseEvent) => void;
  onKeyDown?: (key: string, event: KeyboardEvent) => void;

  showIndicators?: boolean;
}

/**
 * A flexible, accessible table list component with built-in selection and keyboard navigation.
 *
 * Features:
 * - Desktop-style selection behavior with CMD/CTRL+Click and Shift+Click support
 * - Keyboard navigation with arrow keys, space, and enter
 * - Type-ahead search functionality
 * - Responsive column hiding based on screen size
 * - Consecutive visual merging of selected/focused items
 * - Controlled and uncontrolled selection modes
 * - Customizable sizing and styling
 *
 * Selection Behavior:
 * - Regular click: Select only clicked item
 * - Cmd+Click: Toggle selection of clicked item
 * - Shift+Click: Extend selection from anchor to clicked item (multiple mode only)
 * - Arrow keys: Move focus and select item (single selection)
 * - Cmd+Arrow: Move focus without changing selection
 * - Shift+Arrow: Extend selection in direction (multiple mode only)
 * - Space: Toggle selection of focused item
 * - Enter: Activate item (calls onAction) or behaves like click if no onAction
 * - Cmd+A: Select all items (multiple mode only)
 * - Escape: Clear all selection
 *
 * @template T - The type of data items, must extend ListItem
 * @param props - Configuration props for the table list
 * @returns Rendered table list component
 *
 * @example
 * ```tsx
 * interface User extends ListItem {
 *   key: string;
 *   name: string;
 *   email: string;
 * }
 *
 * const columns: ColumnDefinition<User>[] = [
 *   {
 *     key: 'name',
 *     header: 'Name',
 *     render: (user) => user.name,
 *     flex: true,
 *   },
 *   {
 *     key: 'email',
 *     header: 'Email',
 *     render: (user) => user.email,
 *   },
 * ];
 *
 * <TableList
 *   data={users}
 *   columns={columns}
 *   selectionMode="multiple"
 *   onSelectionChange={setSelectedKeys}
 *   onAction={(key) => openUser(key)}
 * />
 * ```
 */
export function TableList<T extends ListItem>({
  data,
  columns,
  headerOffset = 0,
  noHeader = false,
  rowClassName = "",
  headerClassName,
  backgroundClassName,
  notFound,

  // Visual Config
  size = Size.Md,
  variant = Variant.Default,

  // Selection props
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  defaultSelectedKeys,
  focusedKey,
  onFocusChange,
  defaultFocusedKey,
  disallowEmptySelection,
  deselectOnClickAway = true,
  allowTypeAhead,
  allowWrapNavigation,
  getSearchText,
  onAction,
  onKeyDown,

  showIndicators = false,
  appearance = "card",
}: TableListProps<T>) {
  // Apply appearance presets — these can be overridden by explicit className props
  const presetStyles = getAppearanceStyles(appearance);
  const resolvedNoHeader = noHeader || presetStyles.noHeader;
  const resolvedRowClassName = clsx(presetStyles.rowClassName, rowClassName);
  const resolvedHeaderClassName = headerClassName ?? presetStyles.headerClassName;
  const resolvedBackgroundClassName = backgroundClassName ?? presetStyles.backgroundClassName;
  const resolvedSize = size === Size.Md && presetStyles.size ? presetStyles.size : size;
  const [containerRef, containerBounds] = useMeasure();
  const clickAwayDetectorRef = useRef<HTMLDivElement>(null);

  // Initialize the table list state hook
  const tableState = useListState({
    items: data,
    selectionMode,
    selectedKeys,
    onSelectionChange,
    defaultSelectedKeys,
    focusedKey,
    onFocusChange,
    defaultFocusedKey,
    disallowEmptySelection,
    allowTypeAhead,
    allowWrapNavigation,
    getSearchText,
    onAction,
    onKeyDown,
  });

  useClickAway(clickAwayDetectorRef as RefObject<HTMLElement | null>, () => {
    tableState.setFocusedKey(null);
    if (deselectOnClickAway && !disallowEmptySelection) {
      tableState.clearSelection();
    }
  });
  const activeColumns = useMemo(() => {
    const filteredColumns = columns.filter((column) => {
      if (column.requiredSize) {
        return containerBounds.width >= sizeLookup[column.requiredSize];
      } else {
        return true;
      }
    });

    // Add indicators column if showIndicators is true and selection mode is not "none"
    if (showIndicators && selectionMode !== "none") {
      return [
        {
          key: "_indicators",
          header:
            selectionMode === "multiple" ? (
              <div className={clsx(size, "sized-height sized-width grid place-items-center")}>
                <Checkbox
                  asIndicator
                  sizing="list-item"
                  checked={tableState.selectedKeys.size === data.length && data.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      tableState.selectAll();
                    } else {
                      tableState.clearSelection();
                    }
                  }}
                  size={size}
                  variant={variant}
                />
              </div>
            ) : (
              <div className="aspect-square h-full" />
            ),
          align: "center" as const,
          render: (item: T) => {
            if (selectionMode === "single") {
              const selected = tableState.isSelected(item.key);
              return (
                <div className={clsx(size, "sized-height sized-width grid place-items-center")}>
                  <ToggleSquare
                    asIndicator
                    sizing="list-item"
                    value={selected}
                    onChange={(checked) => {
                      if (checked) {
                        tableState.handleItemClick(item.key, {} as MouseEvent);
                      }
                    }}
                    size={size}
                    variant={variant}
                  >
                    {selected && <IconPointFilled className={ICON_CLASS_NAME} />}
                  </ToggleSquare>
                </div>
              );
            } else {
              return (
                <div className={clsx(size, "sized-height sized-width grid place-items-center")}>
                  <Checkbox
                    asIndicator
                    sizing="list-item"
                    checked={tableState.isSelected(item.key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        tableState.select(item.key);
                      } else {
                        tableState.deselect(item.key);
                      }
                    }}
                    size={size}
                    variant={variant}
                  />
                </div>
              );
            }
          },
        },
        ...filteredColumns,
      ];
    }

    return filteredColumns;
  }, [
    columns,
    containerBounds.width,
    showIndicators,
    selectionMode,
    tableState,
    data.length,
    size,
    variant,
  ]);
  const templateColumns = useMemo(() => {
    return getTemplateColumns(activeColumns);
  }, [activeColumns]);

  const gridTemplateAreas = `'${activeColumns.map((c) => c.key).join(" ")}'`;
  const navigationProps = tableState.getNavigationProps();

  return (
    <div
      ref={mergeRefs([clickAwayDetectorRef, containerRef])}
      className={clsx(
        "table-list grid w-full scroll-mt-10 gap-x-4 gap-y-0 p-1",
        resolvedBackgroundClassName,
      )}
      style={{
        gridTemplateColumns: templateColumns,
        gridTemplateAreas,
      }}
      onMouseLeave={() => {
        tableState.setFocusedKey(null);
      }}
      {...navigationProps}
    >
      {!resolvedNoHeader && (
        <header
          className={clsx(
            "sized-height sticky grid w-full grid-cols-subgrid",
            "responsive text-neutral-400 dark:text-neutral-600",
            "border-b border-b-neutral-400 dark:border-b-neutral-600",
            "bg-transparent backdrop-blur-lg",
            "z-1",
            resolvedSize,
            resolvedHeaderClassName,
          )}
          style={{
            top: headerOffset,
            gridColumn: `span ${activeColumns.length.toString()} / span ${activeColumns.length.toString()}`,
          }}
        >
          {activeColumns.map((column) => (
            <div
              className={clsx(
                "text-xs uppercase",
                "sized-height flex w-full flex-row items-center",
                size,
                (column.align === "left" || !column.align) && "justify-start",
                column.align === "center" && "justify-center",
                column.align === "right" && "justify-end",
              )}
              style={{ gridArea: column.key as string }}
              key={String(column.key)}
            >
              {column.header}
            </div>
          ))}
        </header>
      )}
      {data.map((row, idx) => {
        const itemProps = tableState.getItemProps(row.key);
        const consecutiveClass = getConsecutiveClasses(
          data,
          idx,
          tableState.isSelected,
          tableState.isFocused,
        );

        return (
          <Row
            key={row.key}
            row={row}
            noHeader={resolvedNoHeader}
            columns={activeColumns as ColumnDefinition<ListItem>[]}
            idx={idx}
            focused={tableState.isFocused(row.key)}
            selected={tableState.isSelected(row.key)}
            disabled={tableState.isDisabled(row.key)}
            rowClassName={resolvedRowClassName}
            selectionMode={selectionMode}
            size={resolvedSize}
            variant={variant}
            consecutiveClass={consecutiveClass}
            {...itemProps}
          />
        );
      })}
      {data.length === 0 && notFound && (
        <div
          className={clsx("group/row grid", !noHeader && "nth-[2]:mt-1")}
          style={{
            gridColumn: `span ${activeColumns.length.toString()} / span ${activeColumns.length.toString()}`,
          }}
        >
          {notFound}
        </div>
      )}
    </div>
  );
}

interface RowProps<T extends ListItem> {
  rowClassName?: string;
  row: T;
  columns: ColumnDefinition<T>[];
  idx: number;
  focused?: boolean;
  selected?: boolean;
  disabled?: boolean;
  selectionMode?: SelectionMode;

  // Visual Config
  size?: Size;
  variant?: Variant;
  consecutiveClass?: string;
  noHeader?: boolean;

  // Event handlers from useTableListState
  role?: string;
  "aria-selected"?: boolean;
  "aria-disabled"?: boolean;
  tabIndex?: number;
  onClick?: (event: MouseEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

function InnerRow<T extends ListItem>({
  rowClassName,
  row,
  columns,
  focused,
  selected,
  disabled,
  selectionMode,
  size = Size.Md,
  variant = Variant.Default,
  consecutiveClass = "rounded-xs",
  role,
  "aria-selected": ariaSelected,
  "aria-disabled": ariaDisabled,
  tabIndex,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  noHeader = false,
}: RowProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
    }
  }, [focused]);

  return (
    <div
      role={role}
      ref={ref}
      className={clsx(
        "group/row grid grid-cols-subgrid",
        "responsive leading-none",
        consecutiveClass,
        "sized-height sized-text outline-hidden select-none",
        "items-center",
        "responsive table-list-item",
        !noHeader && "nth-[2]:mt-1",
        "z-0",
        size,
        variant,
        rowClassName,
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
      )}
      style={{
        gridColumn: `span ${columns.length.toString()} / span ${columns.length.toString()}`,
      }}
      data-highlighted={focused ? "true" : undefined}
      data-state={selected && selectionMode !== "none" ? "checked" : "unchecked"}
      aria-selected={ariaSelected}
      aria-disabled={ariaDisabled}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown as any as KeyboardEventHandler<HTMLDivElement>}
      onClick={(e) => {
        // Skip row selection if the click originated from an interactive child element
        // (button, input, dropdown trigger, etc.). This prevents row selection from
        // capturing clicks meant for action buttons within the row.
        const target = e.target as HTMLElement;
        if (target !== e.currentTarget && target.closest("button, input, select, textarea, [role='menuitem'], [data-radix-collection-item]")) {
          return;
        }
        (onClick as any as MouseEventHandler<HTMLDivElement>)?.(e);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
    >
      {columns.map((column, columnIndex) => (
        <div
          className={clsx(
            "flex w-full flex-row items-center self-center",
            column.flex && "min-w-0",
            (column.align === "left" || !column.align) && "justify-start",
            column.align === "center" && "justify-center",
            column.align === "right" && "justify-end",
          )}
          key={columnIndex}
        >
          {column.render(row, focused ?? false, selected ?? false)}
        </div>
      ))}
    </div>
  );
}

const Row = memo(InnerRow) as typeof InnerRow;

// const Row = memo(InnerRow);
function getTemplateColumns<T extends ListItem>(columns: ColumnDefinition<T>[]) {
  return columns
    .map((column) => {
      // Indicators column should be auto-sized
      if (column.key === "_indicators") {
        return "auto";
      }
      return column.flex ? "1fr" : "auto";
    })
    .join(" ");
}

const sizeLookup: Record<Size, number> = {
  [Size.Xs]: 320,
  [Size.Sm]: 384,
  [Size.Md]: 448,
  [Size.Lg]: 512,
  [Size.Xl]: 576,
};

/**
 * Helper function to determine consecutive element classes for visual merging.
 * Analyzes neighboring elements to apply appropriate border radius classes.
 *
 * @template T - The type of table list items
 * @param data - Array of all table items
 * @param index - Current item index in the array
 * @param isSelected - Function to check if an item is selected
 * @param isFocused - Function to check if an item is focused
 * @returns CSS class name for border radius styling
 */
function getConsecutiveClasses<T extends ListItem>(
  data: T[],
  index: number,
  isSelected: (key: string) => boolean,
  isFocused: (key: string) => boolean,
): string {
  const current = data[index];
  const prev = data[index - 1];
  const next = data[index + 1];

  const currentActive = isSelected(current.key) || isFocused(current.key);
  const prevActive = prev && (isSelected(prev.key) || isFocused(prev.key));
  const nextActive = next && (isSelected(next.key) || isFocused(next.key));

  if (!currentActive) return "rounded-xs"; // Default rounding for non-active items

  const hasActiveBefore = prevActive;
  const hasActiveAfter = nextActive;

  if (hasActiveBefore && hasActiveAfter) {
    return "rounded-none"; // Middle of group
  } else if (hasActiveBefore) {
    return "rounded-b-xs rounded-t-none"; // End of group
  } else if (hasActiveAfter) {
    return "rounded-t-xs rounded-b-none"; // Start of group
  } else {
    return "rounded-xs"; // Standalone item
  }
}

interface AppearancePreset {
  noHeader: boolean;
  size?: Size;
  rowClassName?: string;
  headerClassName?: string;
  backgroundClassName?: string;
}

function getAppearanceStyles(appearance: TableListAppearance): AppearancePreset {
  switch (appearance) {
    case "panel":
      return {
        noHeader: true,
        size: Size.Lg,
        rowClassName: "bg-transparent hover:bg-neutral-500/10 dark:bg-transparent",
        backgroundClassName: "bg-transparent dark:bg-transparent",
      };
    case "inline":
      return {
        noHeader: true,
        rowClassName: "bg-transparent hover:bg-neutral-500/10 dark:bg-transparent p-0",
        backgroundClassName: "bg-transparent dark:bg-transparent p-0",
      };
    case "card":
    default:
      return {
        noHeader: false,
      };
  }
}
