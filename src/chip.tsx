import { CSSProperties, ReactNode, type MouseEventHandler } from "react";
import { IconX } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";
import {
  getBasicTextColor,
  getChipColor,
  getChipInsertSize,
  getFontSize,
  getHeight,
} from "./style-functions";
import { IconButton } from "./buttons/icon-button";

export interface ChipProps {
  value: string;
  variant?: Variant;
  size?: Size;
  color?: string;
  icon?: ReactNode;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
}

export function Chip({
  value,
  variant,
  size = Size.Md,
  color,
  icon,
  onDelete,
}: ChipProps) {
  return (
    <div
      className={clsx(
        getChipColor(color ? "custom" : variant),
        "flex items-center gap-1 py-1 rounded-sm",
        size === Size.Xs && "px-[4px]",
        size === Size.Sm && "px-[5px]",
        size === Size.Md && "px-[6px]",
        size === Size.Lg && "px-[7px]",
        getFontSize(size),
        "dark:text-white text-black",
        "drop-shadow-sm",
        getHeight(size),
      )}
      style={color ? ({ "--bg-color": color } as CSSProperties) : {}}
    >
      {icon && (
        <div
          style={color ? ({ "--text-color": color } as CSSProperties) : {}}
          className={clsx(
            "dark:bg-white/50 bg-black/50 rounded-sm flex justify-between items-center p-0.5",
            getBasicTextColor(color ? "custom" : variant),
            getChipInsertSize(size),
          )}
        >
          {icon}
        </div>
      )}
      {value}
      {onDelete && (
        <IconButton
          onClick={(e) => {
            onDelete(e);
            console.log("IN DELETE");
            e.stopPropagation();
          }}
          color={color}
          variant={variant}
          className={clsx(
            "dark:bg-white/50 bg-black/50 rounded-sm justify-between items-center",
            "hover:dark:bg-white/75 hover:bg-black/75",
            // getBasicTextColor(color ? "custom" : variant),
            getChipInsertSize(size),
          )}
          size="fit"
        >
          <IconX className={getChipInsertSize(size)} />
        </IconButton>
      )}
    </div>
  );
}
