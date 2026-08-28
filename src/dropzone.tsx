import { clsx } from "clsx";
import { ReactNode } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { IconArrowBigDownLines } from "@tabler/icons-react";
import { ScrollArea } from "./layouts/scroll-area";
import { ListGrid, type ListColumn } from "./list";
import type { ResolveRowVisual } from "./tree/resolve-row-visual";
import { Size } from "./types";

/**
 * A drop target and the listing of what has been dropped on it.
 *
 * The listing half of this API is `ListGrid`'s, prop for prop — `data`, `getRowId`,
 * `columns`, `resolveVisual`, `size`, `noHeader` mean here exactly what they mean
 * there, because a wrapper's public API mirrors the component it renders inside. A
 * caller who knows how to describe a listing already knows how to describe this one,
 * and a row here looks like a row anywhere else in the product.
 *
 * Row appearance is `resolveVisual`, not a class: the shared left-bar + tint is how
 * every row-shaped list in the system expresses state, and a per-row class would let
 * one listing opt out of that and drift.
 */
export interface DropzoneProps<T> {
  onDrop: (files: File[]) => void;
  data: T[];
  /** Stable id for a row. Must be referentially stable; `ListGrid` keys its memos off it. */
  getRowId: (item: T) => string;
  columns: ListColumn<T>[];
  /** Per-row styling. Defaults to the shared hover/selection tint. */
  resolveVisual?: ResolveRowVisual<T>;
  /** Type-ahead target. Defaults to the row id, which is rarely what a reader types. */
  getSearchText?: (item: T) => string;
  noHeader?: boolean;
  size?: Size;
  /** Accessible name for the listing. */
  ariaLabel?: string;
  multiple?: boolean;
  accept?: Accept;
  dropText?: string;
  children?: ReactNode;
  className?: string;
}

export function Dropzone<T>({
  onDrop,
  data,
  getRowId,
  columns,
  resolveVisual,
  getSearchText,
  noHeader,
  size,
  ariaLabel = "Files",
  multiple,
  accept,
  children,
  className,
  dropText,
}: DropzoneProps<T>) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    accept,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "grid cursor-pointer",
        "md:grid-cols-[1fr_1fr] md:grid-rows-1",
        "grid-cols-1 grid-rows-[2fr_3fr]",
        "focus:outline-hidden",
        "relative",
        className,
      )}
    >
      {children ? (
        <button
          type="button"
          className="h-full w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </button>
      ) : null}
      <input {...getInputProps()} />
      {data.length !== 0 && (
        <ScrollArea orientation="vertical">
          <ListGrid
            data={data}
            getRowId={getRowId}
            columns={columns}
            resolveVisual={resolveVisual}
            getSearchText={getSearchText}
            noHeader={noHeader}
            size={size}
            ariaLabel={ariaLabel}
          />
        </ScrollArea>
      )}
      {data.length === 0 && (
        <div className="grid place-items-center">
          <div className="grid max-h-40 grid-cols-1 place-items-center gap-3">
            <div className="h-32 w-32">
              <IconArrowBigDownLines size="128px" className="text-info" />
            </div>
            <span className="text-info">
              {dropText ?? `Drag and Drop File${multiple ? "s" : ""} Here`}
            </span>
          </div>
        </div>
      )}
      {isDragActive && data.length === 0 && (
        <div className="outline-info absolute top-0 right-0 bottom-0 left-0 grid place-items-center bg-white/50 outline -outline-offset-4 backdrop-blur-xs dark:bg-black/50">
          <div className="grid max-h-40 grid-cols-1 place-items-center gap-3">
            <div className="h-32 w-32">
              <IconArrowBigDownLines size="128px" className="text-info" />
            </div>
            <span className="text-info">
              {dropText ?? `Drag and Drop File${multiple ? "s" : ""} Here`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
