import { MouseEventHandler, ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";
import { getReversibleBgText } from "../variant-colors";

export interface MenuButtonProps {
  children: ReactNode;
  variant: Variant;
  onClick: MouseEventHandler;
  active?: boolean;
}

export function MenuButton({
  children,
  variant,
  onClick,
  active,
}: MenuButtonProps) {
  return (
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
  );
}
