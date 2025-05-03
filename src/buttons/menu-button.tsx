import { ForwardedRef, forwardRef, MouseEventHandler, ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";
import { Status } from "../feedback/status";
import { Tooltip } from "../floating/tooltip";
import { useDesktopState, useMenuState } from "../hooks/layout-atoms";

interface MenuButtonProps {
  children: string;
  altText?: string;
  icon: ReactNode;
  onClick?: MouseEventHandler;
  active?: boolean;
  hoverable?: boolean;
  variant?: Variant;
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
  className?: string;
  textClassName?: string;
}

function InnerMenuButton(
  {
    children,
    altText,
    icon,
    onClick,
    active,
    hoverable,
    status,
    variant,
    className,
    textClassName,
  }: MenuButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const menuOpen = useMenuState();
  const desktop = useDesktopState();
  const Wrapper = status ? Status : "div";
  const wrapperProps = status
    ? {
        variant: status.variant,
        placement: status.placement,
        text: status.text,
        className: clsx(
          "responsive",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
        ),
      }
    : {
        className: clsx(
          "responsive",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
          "w-9 h-9 grid place-items-center",
        ),
      };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      className={clsx(
        variant,
        "w-9 group/tab h-9 overflow-hidden",
        "desktop:group-data-expanded/menu:w-[188px]",
        "overflow-hidden transition-all",
        "grid place-items-center grid-cols-[36px_1fr] grid-rows-1 gap-[6px]",
        className,
      )}
      onClick={onClick}
    >
      <Tooltip
        invert
        variant={active ? variant : Variant.Default}
        controlledState={menuOpen ? [false, () => {}] : undefined}
        content={altText ?? children}
        side={desktop ? "right" : "top"}
      >
        <Wrapper {...wrapperProps}>{icon}</Wrapper>
      </Tooltip>
      <span
        className={clsx(
          "responsive",
          "desktop:group-data-expanded/menu:opacity-100",
          "opacity-0 text-left w-[150px]",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
          textClassName,
        )}
      >
        {children}
      </span>
    </button>
  );
}

export const MenuButton = forwardRef(InnerMenuButton);
