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
        "focus:outline-none",
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
          <TableList data={data} columns={columns} rowClassName={rowClassName} />
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
        <div className="absolute left-0 right-0 top-0 bottom-0 outline outline-info -outline-offset-4 grid place-items-center backdrop-blur-sm">
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

      {/* <ScrollArea orientation="vertical" className="h-full w-full">
          <TableList
            data={FAKE_DATA}
            columns={[{ key: "name", header: "Name", render: (item) => item.name }]}
          />
        </ScrollArea> */}
      {/* If at least one item is uploaded, show a list of all files*/}
      {/* {items.length > 0 ? (
          <ScrollArea orientation="vertical">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                {renderFn(item, index)}
              </div>
            ))}
          </ScrollArea>
        ) : (
          <div className="grid gap-3 grid-cols-1 justify-items-center">
            <div className="h-32 w-32 z-1">
              <IconArrowBigDownLines size="128px" className="" />
            </div>
            <span>{dropText ?? `Drag and Drop File${multiple ? "s" : ""} Here`}</span>
          </div>
        )} */}
    </div>
  );
}
