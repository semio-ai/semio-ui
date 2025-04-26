import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { clsx } from "clsx";
import { ForwardedRef, MouseEventHandler, forwardRef } from "react";
import { Variant, Size } from "./types";
import { Status } from "./status";

export interface AvatarProps {
  src?: string;
  icon?: React.ReactNode;
  alt: string;
  size?: Size;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  variant?: Variant;
  border?: boolean;
  invert?: boolean;
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
      variant = Variant.Default,
      invert = false,
      border = false,
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
          className={clsx(variant, "rounded-sm", size, "sized-height sized-width", className)}
        >
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className={clsx(
              "responsive",
              size,
              variant,
              onClick ? "cursor-pointer" : "cursor-default",
              border && onClick && "variant-responsive-persistent-outline",
              border && !onClick && "variant-static-persistent-outline",
              "sized-height sized-width",
              "object-cover",
              "rounded-sm",
              className,
            )}
          />
          <AvatarPrimitive.Fallback
            className={clsx(
              "responsive",
              variant,
              size,
              onClick ? "cursor-pointer" : "cursor-default",
              "flex items-center justify-center rounded-sm select-none",
              !border && !invert && onClick && "variant-responsive-bg",
              !border && !invert && !onClick && "variant-static-bg",
              border &&
                !invert &&
                onClick &&
                "variant-responsive-bg variant-responsive-appearing-outline",
              border &&
                !invert &&
                !onClick &&
                "variant-static-bg outline -outline-offset-1 dark:outline-black/25 outline-white/25",
              !border && invert && onClick && "variant-responsive-text",
              !border && invert && !onClick && "variant-static-text",
              border &&
                invert &&
                onClick &&
                "variant-responsive-text variant-responsive-persistent-outline",
              border &&
                invert &&
                !onClick &&
                "variant-static-text variant-static-persistent-outline",
              "sized-height sized-width",
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
