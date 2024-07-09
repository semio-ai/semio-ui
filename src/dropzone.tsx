import { clsx } from "clsx";
import { useDropzone, type Accept } from "react-dropzone";
import { IconArrowBigDownLines } from "@tabler/icons-react";

export interface DropzoneProps<T> {
  onDrop: (files: File[]) => void;
  items: T[];
  renderFn: (item: T, index: number) => React.ReactNode;
  multiple?: boolean;
  accept?: Accept;
  dropText?: string;
}

export function Dropzone<T>({
  onDrop,
  items,
  renderFn,
  multiple,
  accept,
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
        isDragActive
          ? "dark:bg-neutral-900 bg-neutral-100"
          : "dark:bg-black bg-white hover:dark:bg-neutral-950 hover:bg-neutral-50",
        "h-[30vh] w-full mt-3",
        "cursor-pointer mb-3",
        isDragActive &&
          " bg-radient-ellipse-c from-info-500/25 from-0% to-transparent to-80% transition-all duration-300",
        isDragActive || items.length === 0
          ? "grid place-items-center hover:text-info-500 overflow-hidden"
          : "overflow-y-scroll",
      )}
    >
      <input {...getInputProps()} />
      {/* If a URDF is present, show a list of all files (including the URDF) */}
      {!isDragActive && items.length > 0 ? (
        <>
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3">
              {renderFn(item, index)}
            </div>
          ))}
        </>
      ) : (
        <div className="grid gap-3 grid-cols-1 justify-items-center">
          <div className="h-32 w-32 z-10">
            <IconArrowBigDownLines size="128px" className="" />
          </div>
          <span>
            {dropText ?? `Drag and Drop File${multiple ? "s" : ""} Here`}
          </span>
        </div>
      )}
    </div>
  );
}
