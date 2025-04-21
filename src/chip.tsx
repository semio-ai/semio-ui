import { CSSProperties, ReactNode, type MouseEventHandler, cloneElement } from "react";
import { IconX } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";
import { Button } from "./buttons/button";
import { alpha, altColor } from "@semio/utils";
import { StaticIcon } from "./icons/static-icon";

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
        "variant-responsive-bg variant-responsive-text sized-text sized-height",
        "grid grid-rows-1 place-items-center",
        "px-2 gap-2",
        "xs:px-1 xs:gap-1 sm:px-[6px] sm:gap-[6px]",
        "xl:px-[10px] xl:gap-[10px]",
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
              "--darker-custom-color": altColor(color, -0.1),
              "--lighter-custom-color": altColor(color, 0.2),
              "--deemphasized-custom-color": alpha(color, 0.5),
            } as CSSProperties)
          : undefined
      }
    >
      {renderIcon && (
        <div
          className={clsx(
            size,
            "sized-chip-insert",
            "dark:bg-black/50 bg-white/50 rounded-xs grid place-items-center",
          )}
        >
          {renderIcon("w-4/5 h-4/5")}
        </div>
      )}
      <div className="dark:text-black/75 text-white/75">{children}</div>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            onDelete(e);
            e.stopPropagation();
          }}
          className={clsx(
            size,
            "sized-chip-insert",
            "dark:bg-black/50 bg-white/50 rounded-xs grid place-items-center",
            "dark:hover:bg-black/75 hover:bg-white/75",
          )}
        >
          <IconX className="w-4/5 h-4/5" />
        </button>
      )}
    </div>
  );
}
