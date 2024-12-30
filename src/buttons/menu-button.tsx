import { MouseEventHandler, ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";
import { Status } from "../status";
import { Tooltip } from "../tooltip";

export interface MenuButtonProps {
  id: string;
  children: ReactNode;
  title: ReactNode;
  variant?: Variant.Primary | Variant.Secondary | Variant.Tertiary | Variant.Default;
  onClick?: MouseEventHandler;
  active?: boolean;
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
  hoverable?: boolean;
}

export function MenuButton({
  id,
  children,
  title,
  variant = Variant.Primary,
  onClick,
  active,
  status,
  hoverable = true,
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
    // <Tooltip content={title} variant={variant} side="left">
    <button
      type="button"
      role="tab"
      aria-selected={active}
      id={id}
      className={clsx(
        "w-10 group-data-expanded/menu:w-48 h-10 group/button p-2 transition-all duration-100",
        hoverable && "hover:dark:text-neutral-400 hover:text-neutral-600",
        hoverable && "hover:scale-105 scale-100",
        "group-data-expanded/menu:origin-left origin-center",
        "flex flex-row gap-[6px]",
        "text-neutral-500 overflow-x-hidden",
        getSelectedStyles(variant),
      )}
      onClick={onClick}
    >
      <Wrapper {...wrapperProps}>{children}</Wrapper>
      <span className="transition-colors group-data-expanded/menu:opacity-100 opacity-0">
        {title}
      </span>
    </button>
    // </Tooltip>
  );
}

const getSelectedStyles = (variant: Variant): string => {
  switch (variant) {
    case Variant.Primary:
      return "dark:aria-selected:text-primary-100 aria-selected:text-primary-900";
    case Variant.Secondary:
      return "dark:aria-selected:text-secondary-100 aria-selected:text-secondary-900";
    case Variant.Tertiary:
      return "dark:aria-selected:text-tertiary-100 aria-selected:text-tertiary-900";
    case Variant.Default:
    default:
      return "dark:aria-selected:text-neutral-100 aria-selected:text-neutral-900";
  }
};
