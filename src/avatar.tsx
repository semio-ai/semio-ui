import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { clsx } from "clsx";
import { ForwardedRef, MouseEventHandler, forwardRef } from "react";
import { Variant, Size } from "./types";
import {
  getHeight,
  getWidth,
  getHoverButtonStyles,
  getBasicBgColor,
  getOutline,
} from "./style-functions";
import { Status } from "./status";

export interface AvatarProps {
  src?: string;
  icon?: React.ReactNode;
  alt: string;
  size?: Size;
  rounded?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  variant?: Variant;
  border?: Variant;
  noHover?: boolean;
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
  className?: string;
}

export const Avatar = forwardRef(
  (
    {
      src,
      alt,
      icon,
      size = Size.Md,
      onClick,
      status,
      rounded = true,
      variant = Variant.Default,
      border,
      noHover = false,
      className,
    }: AvatarProps,
    ref: ForwardedRef<HTMLSpanElement>,
  ) => {
    const fallbackContent = icon ?? alt?.[0] ?? "?";

    const Wrapper = status ? Status : "div";
    const wrapperProps = status
      ? {
          variant: status.variant,
          placement: status.placement,
          text: status.text,
        }
      : {};

    return (
      <Wrapper {...wrapperProps}>
        <AvatarPrimitive.Root
          ref={ref}
          onClick={onClick}
          className={clsx(
            !noHover && "hover:outline outline-2 outline-neutral-500",
            rounded && "rounded-full",
            getHeight(size),
            getWidth(size),
            className,
          )}
        >
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className={clsx(
              getHeight(size),
              getWidth(size),
              "object-cover",
              border && "outline outline-offset-1 outline-1",
              border && getOutline(border),
              rounded && "rounded-full",
              className,
            )}
          />
          <AvatarPrimitive.Fallback
            className={clsx(
              "flex items-center justify-center",
              "dark:text-black text-white font-bold",
              "bg-neutral-500 dark:group-hover:bg-neutral-800 group-hover:bg-neutral-200",
              "dark:group-hover:text-neutral-200 group-hover:bg-neutral-800",
              !noHover && "dark:group-hover:text-white group-hover:text-black",
              rounded && "rounded-full",
              border && "outline outline-offset-1 outline-1",
              border && getOutline(border),
              getHeight(size),
              getWidth(size),
              noHover ? getBasicBgColor(variant) : getHoverButtonStyles(variant),
              className,
            )}
          >
            {fallbackContent}
          </AvatarPrimitive.Fallback>
        </AvatarPrimitive.Root>
      </Wrapper>
    );
  },
);

Avatar.displayName = "Avatar";
