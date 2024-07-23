import { MouseEventHandler, ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";
import { Tooltip } from "../tooltip";
import { getReversibleBgText } from "../style-functions";

export interface MenuButtonProps {
  children: ReactNode;
  title: ReactNode;
  variant: Variant;
  onClick?: MouseEventHandler;
  active?: boolean;
}

export function MenuButton({
  children,
  title,
  variant,
  onClick,
  active,
}: MenuButtonProps) {
  return (
    <Tooltip content={title} variant={variant} side="left">
      <button
        type="button"
        className={clsx(
          "w-10 h-10 group p-2 hover:dark:text-black hover:text-white transition-all duration-100",
          getReversibleBgText(variant, active),
        )}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}
