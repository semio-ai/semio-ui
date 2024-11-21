import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { clsx } from "clsx";
import { ForwardedRef, MouseEventHandler, forwardRef } from "react";
import { Variant, Size } from "./types";
import { getHeight, getWidth, getHoverButtonStyles } from "./style-functions";
import { Status } from "./status";

export interface AvatarProps {
  src?: string;
  icon?: React.ReactNode;
  alt: string;
  size?: Size;
  rounded?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  variant?: Variant;
  noHover?: boolean;
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
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
      noHover = false,
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
          )}
        >
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className={clsx(
              getHeight(size),
              getWidth(size),
              "object-cover",
              rounded && "rounded-full",
            )}
          />
          <AvatarPrimitive.Fallback
            className={clsx(
              "flex items-center justify-center",
              "dark:text-black text-white font-bold",
              "bg-neutral-500 group-hover:dark:bg-neutral-800 group-hover:bg-neutral-200",
              "group-hover:dark:text-white group-hover:text-black",
              rounded && "rounded-full",
              getHeight(size),
              getWidth(size),
              getHoverButtonStyles(variant),
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
