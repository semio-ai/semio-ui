import { clsx } from "clsx";
import { ReactNode } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { IconArrowBigDownLines } from "@tabler/icons-react";
import { TableListItem } from "./hooks/use-table-list-state";
import { ScrollArea } from "./layouts/scroll-area";
import { ColumnDefinition, TableList } from "./layouts/table-list";

export interface DropzoneProps<T extends TableListItem> {
  onDrop: (files: File[]) => void;
  data: T[];
  columns: ColumnDefinition<T>[];
  rowClassName?: string;
  headerClassName?: string;
  multiple?: boolean;
  accept?: Accept;
  dropText?: string;
  children?: ReactNode;
  className?: string;
}

export function Dropzone<T extends TableListItem>({
  onDrop,
  data,
  columns,
  rowClassName,
  headerClassName,
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
        // !(isDragActive && data.length === 0) && "backdrop-blur-md",
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
          <TableList
            data={data}
            // backgroundClassName="backdrop-blur-lg"
            columns={columns}
            rowClassName={rowClassName}
            headerClassName={headerClassName}
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
