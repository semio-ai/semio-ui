import { type ReactNode, type RefObject, useState, useRef, useEffect, useMemo, memo } from "react";
import { clsx } from "clsx";
import useMeasure from "react-use-measure";
import { mergeRefs } from "react-merge-refs";
import { Size } from "./types";
import { useClickAway } from "./hooks/use-click-away";

export interface BasicRowData {
  id: string;
}

export interface ColumnDefinition<T extends BasicRowData> {
  key: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  flex?: boolean;
  requiredSize?: Size;
  render: (value: T) => ReactNode;
}

export interface TableListProps<T extends BasicRowData> {
  data: T[];
  columns: ColumnDefinition<T>[];
  headerOffset?: number;
  noHeader?: boolean;
  rowClassName?: string;
  fullWidth?: boolean;
  headerClassName?: string;
  backgroundClassName?: string;
  notFound?: ReactNode;
  onFocusChange?: (focusedRow?: string) => void;
  onRowEnter?: (row: string) => void;
  onRowClick?: (row: string) => void;
  selection?: string[];
  transparentHeader?: boolean;
}

export function TableList<T extends BasicRowData>({
  data,
  columns,
  headerOffset = 0,
  noHeader = false,
  rowClassName = "",
  headerClassName,
  backgroundClassName,
  notFound,
  onFocusChange,
  onRowEnter,
  onRowClick,
  selection,
  transparentHeader = true,
}: TableListProps<T>) {
  const [containerRef, containerBounds] = useMeasure();
  const clickAwayDetectorRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  useClickAway(clickAwayDetectorRef as RefObject<HTMLElement | null>, () => {
    setFocusIndex(null);
    onFocusChange?.(undefined);
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

  return (
    <div
      ref={mergeRefs([clickAwayDetectorRef, containerRef])}
      className={clsx("grid w-full scroll-mt-10 gap-x-4", "backdrop-blur-sm", backgroundClassName)}
      style={{
        gridTemplateColumns: templateColumns,
        gridTemplateAreas,
      }}
    >
      {!noHeader && (
        <header
          className={clsx(
            "h-10 grid grid-cols-subgrid sticky w-full z-[1]",
            "dark:text-neutral-600 text-neutral-400 backdrop-blur-lg",
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
      {data.map((row, idx) => (
        <Row
          key={row.id}
          row={row}
          columns={activeColumns as ColumnDefinition<BasicRowData>[]}
          idx={idx}
          onFocusChange={(focused) => {
            setFocusIndex(focused ? idx : null);
            onFocusChange?.(focused ? row.id : undefined);
          }}
          focused={focusIndex === idx}
          rowClassName={rowClassName}
          onShiftUp={() => {
            if (idx > 0) {
              setFocusIndex(idx - 1);
            } else {
              setFocusIndex(data.length - 1);
            }
          }}
          onShiftDown={() => {
            if (idx < data.length - 1) {
              setFocusIndex(idx + 1);
            } else {
              setFocusIndex(0);
            }
          }}
          onEnter={() => {
            onRowEnter?.(row.id);
          }}
          onClick={onRowClick ? () => onRowClick?.(row.id) : undefined}
          selected={selection?.includes(row.id)}
        />
      ))}
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

interface RowProps<T extends BasicRowData> {
  rowClassName?: string;
  row: T;
  columns: ColumnDefinition<T>[];
  idx: number;
  onFocusChange: (focused: boolean) => void;
  focused?: boolean;
  onShiftUp?: () => void;
  onShiftDown?: () => void;
  onEnter?: () => void;
  onClick?: () => void;
  selected?: boolean;
}

function InnerRow<T extends BasicRowData>({
  rowClassName,
  row,
  columns,
  idx,
  onFocusChange,
  focused,
  onShiftUp,
  onShiftDown,
  onEnter,
  onClick,
  selected,
}: RowProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
    } else if (!focused && ref.current) {
      ref.current.blur();
    }
  });
  // eslint-ignore-next-line non-interactive-element-interactions
  return (
    <div
      role="option"
      ref={ref}
      className={clsx("group/row grid grid-cols-subgrid", rowClassName)}
      style={{
        gridColumn: `span ${columns.length.toString()} / span ${columns.length.toString()}`,
      }}
      aria-selected={selected}
      // data-ui={selected ? "selected" : ""}
      key={row.id}
      tabIndex={idx}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" && focused) {
          event.preventDefault();
          onShiftDown?.();
        } else if (event.key === "ArrowUp" && focused) {
          event.preventDefault();
          onShiftUp?.();
        } else if (event.key === "Enter" && focused && onEnter) {
          event.stopPropagation();
          onEnter();
        }
      }}
      onClick={() => {
        if (onClick) {
          onFocusChange(true);
          onClick?.();
        }
      }}
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
function getTemplateColumns<T extends BasicRowData>(columns: ColumnDefinition<T>[]) {
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
};
