import { Avatar as AvatarPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { ForwardedRef, MouseEventHandler, forwardRef } from "react";
import { Status } from "./feedback/status";
import { Variant, Size } from "./types";

export interface AvatarProps {
  src?: string;
  icon?: React.ReactNode;
  alt: string;
  size?: Size;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  variant?: Variant;
  visuals?: "default" | "border" | "inverted" | "inverted-border";
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
  className?: string;
}

/**
 * An avatar component that displays user images, icons, or initials with various visual styles.
 * @param src - Optional source URL for the avatar image
 * @param icon - Optional icon to display in the avatar
 * @param alt - Alt text for the avatar (required for accessibility)
 * @param size - Optional size to apply to the avatar
 * @param onClick - Optional click handler
 * @param variant - Optional variant to apply to the avatar (default is "default")
 * @param visuals - Visual style of the avatar: "default", "border", "inverted", or "inverted-border"
 * @param status - Optional status indicator with variant, placement, and text
 * @param className - Optional additional CSS classes
 */
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
      visuals = "default",
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
          size,
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
              (visuals === "border" || visuals === "inverted-border") &&
                onClick &&
                "variant-responsive-persistent-outline",
              (visuals === "border" || visuals === "inverted-border") &&
                !onClick &&
                "variant-static-persistent-outline",
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
              (visuals === "default" || visuals === "border") && "text-white dark:text-black",
              (visuals === "inverted" || visuals === "inverted-border") &&
                onClick &&
                "variant-responsive-text",
              (visuals === "inverted" || visuals === "inverted-border") &&
                !onClick &&
                "variant-static-text",
              "grid place-items-center rounded-sm select-none",
              visuals === "default" && onClick && "variant-responsive-bg",
              visuals === "default" && !onClick && "variant-static-bg",
              visuals === "border" &&
                onClick &&
                "variant-responsive-bg variant-responsive-appearing-outline",
              visuals === "border" &&
                !onClick &&
                "variant-static-bg outline -outline-offset-1 dark:outline-black/25 outline-white/25",
              visuals === "inverted-border" && onClick && "variant-responsive-persistent-outline",
              visuals === "inverted-border" && !onClick && "variant-static-persistent-outline",
              "sized-height sized-width sized-text",
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
