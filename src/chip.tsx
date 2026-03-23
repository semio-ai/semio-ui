import { CSSProperties, ReactNode, type MouseEventHandler } from "react";
import { IconX } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";
import { ICON_CLASS_NAME } from "./constants/icon";

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
        "gap-2 p-[2px]",
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
            "grid place-items-center rounded-[1px] bg-white/50 dark:bg-black/50",
          )}
        >
          {renderIcon(ICON_CLASS_NAME)}
        </div>
      )}
      <div className="dark:text-red/75 px-2 text-white/75">{children}</div>
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
            "grid place-items-center rounded-[1px] bg-white/50 dark:bg-black/50",
          )}
        >
          <IconX className={ICON_CLASS_NAME} />
        </button>
      )}
    </div>
  );
}
