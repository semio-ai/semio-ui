import { clsx } from "clsx";
import { ReactNode } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { IconArrowBigDownLines } from "@tabler/icons-react";
import { ScrollArea } from "./scroll-area";
import { BasicRowData, ColumnDefinition, TableList } from "./table-list";

export interface DropzoneProps<T extends BasicRowData> {
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

export function Dropzone<T extends BasicRowData>({
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
        "cursor-pointer grid",
        "md:grid-cols-[1fr_1fr] md:grid-rows-1",
        "grid-cols-1 grid-rows-[2fr_3fr]",
        "focus:outline-hidden",
        "relative",
        !(isDragActive && data.length === 0) && "backdrop-blur-md",
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
            transparentHeader={false}
          />
        </ScrollArea>
      )}
      {data.length === 0 && (
        <div className="grid place-items-center">
          <div className="grid place-items-center grid-cols-1 gap-3 max-h-40">
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
        <div className="absolute left-0 right-0 top-0 bottom-0 outline outline-info -outline-offset-4 grid place-items-center bg-white/50 dark:bg-black/50 backdrop-blur-xs">
          <div className="grid place-items-center grid-cols-1 gap-3 max-h-40">
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
