import { CSSProperties, ReactNode, type MouseEventHandler } from "react";
import { IconX } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";

export interface ChipProps {
  children: string;
  variant?: Variant;
  size?: Size;
  color?: string;
  renderIcon?: (className: string) => ReactNode;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
}

export function Chip({
  children,
  variant,
  size = Size.Md,
  color,
  renderIcon,
  onDelete,
}: ChipProps) {
  return (
    <div
      className={clsx(
        "variant-responsive-bg variant-responsive-text",
        "sized-text sized-height",
        "responsive grid grid-rows-1 place-items-center",
        "p-[2px] gap-2",
        renderIcon && children && onDelete && "grid-cols-[auto_1fr_auto]",
        renderIcon && children && !onDelete && "grid-cols-[auto_1fr]",
        !renderIcon && children && onDelete && "grid-cols-[1fr_auto]",
        renderIcon && !children && onDelete && "grid-cols-[auto_auto]",
        renderIcon && !children && !onDelete && "grid-cols-[auto]",
        color ? "custom-color" : variant,
        size,
      )}
      style={
        color
          ? ({
              "--custom-color": color,
            } as CSSProperties)
          : undefined
      }
    >
      {renderIcon && (
        <div
          className={clsx(
            "responsive",
            size,
            "sized-inner-group-item",
            "dark:bg-black/50 bg-white/50 rounded-[1px] grid place-items-center",
          )}
        >
          {renderIcon("w-3/5 h-3/5")}
        </div>
      )}
      <div className="dark:text-red/75 text-white/75 px-2">{children}</div>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            onDelete(e);
            e.preventDefault();
            e.stopPropagation();
          }}
          className={clsx(
            size,
            "sized-inner-group-item",
            "dark:bg-black/50 bg-white/50 rounded-[1px] grid place-items-center",
          )}
        >
          <IconX className="w-3/5 h-3/5" />
        </button>
      )}
    </div>
  );
}
