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
import { useClickAway } from "../hooks/use-click-away";
import {
  useTableListState,
  type TableListItem,
  type SelectionMode,
  type SelectionBehavior,
} from "../hooks/use-table-list-state";
import { Size } from "../types";

export interface ColumnDefinition<T extends TableListItem> {
  key: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  flex?: boolean;
  requiredSize?: Size;
  render: (value: T) => ReactNode;
}

export interface TableListProps<T extends TableListItem> {
  data: T[];
  columns: ColumnDefinition<T>[];
  headerOffset?: number;
  noHeader?: boolean;
  rowClassName?: string;
  fullWidth?: boolean;
  headerClassName?: string;
  backgroundClassName?: string;
  notFound?: ReactNode;

  // Selection configuration
  selectionMode?: SelectionMode;
  selectionBehavior?: SelectionBehavior;

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

  // Navigation options
  allowTypeAhead?: boolean;
  allowWrapNavigation?: boolean;
  getSearchText?: (item: T) => string;

  // Event handlers
  onAction?: (key: string, event: KeyboardEvent | MouseEvent) => void;
  onKeyDown?: (key: string, event: KeyboardEvent) => void;

  transparentHeader?: boolean;
}

export function TableList<T extends TableListItem>({
  data,
  columns,
  headerOffset = 0,
  noHeader = false,
  rowClassName = "",
  headerClassName,
  backgroundClassName,
  notFound,

  // Selection props
  selectionMode = "none",
  selectionBehavior = "toggle",
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

  transparentHeader = true,
}: TableListProps<T>) {
  const [containerRef, containerBounds] = useMeasure();
  const clickAwayDetectorRef = useRef<HTMLDivElement>(null);

  // Initialize the table list state hook
  const tableState = useTableListState({
    items: data,
    selectionMode,
    selectionBehavior,
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
  });
  const activeColumns = useMemo(() => {
    return columns.filter((column) => {
      if (column.requiredSize) {
        return containerBounds.width >= sizeLookup[column.requiredSize];
      } else {
        return true;
      }
    });
  }, [columns, containerBounds.width]);
  const templateColumns = useMemo(() => {
    return getTemplateColumns(activeColumns);
  }, [activeColumns]);

  const gridTemplateAreas = `'${activeColumns.map((c) => c.key).join(" ")}'`;
  const navigationProps = tableState.getNavigationProps();

  return (
    <div
      ref={mergeRefs([clickAwayDetectorRef, containerRef])}
      className={clsx("grid w-full scroll-mt-10 gap-x-4", backgroundClassName)}
      style={{
        gridTemplateColumns: templateColumns,
        gridTemplateAreas,
      }}
      {...navigationProps}
    >
      {!noHeader && (
        <header
          className={clsx(
            "h-10 grid grid-cols-subgrid sticky w-full",
            "dark:text-neutral-600 text-neutral-400",
            transparentHeader ? "dark:bg-black/50 bg-white/50" : "bg-white dark:bg-black",
            headerClassName,
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
                "h-10 w-full flex flex-row items-center",
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

        return (
          <Row
            key={row.key}
            row={row}
            columns={activeColumns as ColumnDefinition<TableListItem>[]}
            idx={idx}
            focused={tableState.isFocused(row.key)}
            selected={tableState.isSelected(row.key)}
            disabled={tableState.isDisabled(row.key)}
            rowClassName={rowClassName}
            selectionMode={selectionMode}
            {...itemProps}
          />
        );
      })}
      {data.length === 0 && notFound && (
        <div
          className={clsx("group/row grid grid-cols-subgrid")}
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

interface RowProps<T extends TableListItem> {
  rowClassName?: string;
  row: T;
  columns: ColumnDefinition<T>[];
  idx: number;
  focused?: boolean;
  selected?: boolean;
  disabled?: boolean;
  selectionMode?: SelectionMode;

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

function InnerRow<T extends TableListItem>({
  rowClassName,
  row,
  columns,
  focused,
  selected,
  disabled,
  selectionMode,
  role,
  "aria-selected": ariaSelected,
  "aria-disabled": ariaDisabled,
  tabIndex,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
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
      className={clsx("group/row grid grid-cols-subgrid text-black dark:text-white", rowClassName, {
        "bg-blue-50 dark:bg-blue-900/20": selected && selectionMode !== "none",
        "ring-2 ring-blue-500": focused,
        "opacity-50 cursor-not-allowed": disabled,
      })}
      style={{
        gridColumn: `span ${columns.length.toString()} / span ${columns.length.toString()}`,
      }}
      aria-selected={ariaSelected}
      aria-disabled={ariaDisabled}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown as any as KeyboardEventHandler<HTMLDivElement>}
      onClick={onClick as any as MouseEventHandler<HTMLDivElement>}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {columns.map((column, columnIndex) => (
        <div
          className={clsx(
            "w-full flex flex-row items-center self-center",
            column.flex && "min-w-0",
            (column.align === "left" || !column.align) && "justify-start",
            column.align === "center" && "justify-center",
            column.align === "right" && "justify-end",
          )}
          key={columnIndex}
        >
          {column.render(row)}
        </div>
      ))}
    </div>
  );
}

const Row = memo(InnerRow) as typeof InnerRow;

// const Row = memo(InnerRow);
function getTemplateColumns<T extends TableListItem>(columns: ColumnDefinition<T>[]) {
  return columns
    .map((column) => {
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
