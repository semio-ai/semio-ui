import { MouseEventHandler, ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";
import { Status } from "../status";
import { Tooltip } from "../tooltip";

export interface MenuButtonProps {
  id: string;
  children: ReactNode;
  title: ReactNode;
  variant: Variant;
  onClick?: MouseEventHandler;
  active?: boolean;
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
}

export function MenuButton({
  id,
  children,
  title,
  variant,
  onClick,
  active,
  status,
}: MenuButtonProps) {
  const Wrapper = status ? Status : "div";
  const wrapperProps = status
    ? {
        variant: status.variant,
        placement: status.placement,
        text: status.text,
      }
    : {};

  return (
    <Tooltip content={title} variant={variant} side="left">
      <button
        type="button"
        role="tab"
        aria-selected={active}
        id={id}
        className={clsx(
          "w-10 h-10 group p-2 transition-all duration-100",
          // "hover:dark:text-white hover:text-black",
          "text-neutral-500",
          "dark:aria-selected:text-primary-100 aria-selected:text-primary-900",
          "group",
          // "dark:aria-selected:hover:text-secondary-100 aria-selected:hover:text-secondary-900",
          // "dark:hover:text-white hover:text-black",
          //"border-r-2 border-solid border-transparent hover:border-white/30 aria-selected:hover:border-primary-100/30",
        )}
        onClick={onClick}
      >
        <Wrapper {...wrapperProps}>{children}</Wrapper>
      </button>
    </Tooltip>
  );
}
