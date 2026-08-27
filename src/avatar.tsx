import { Avatar as AvatarPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { ForwardedRef, MouseEventHandler, forwardRef } from "react";
import { Status } from "./feedback/status";
import { Variant, Size } from "./types";

export interface AvatarProps {
  src?: string;
  icon?: React.ReactNode;
  alt: string;
  /** Accessible label for the avatar when used as an interactive element. */
  "aria-label"?: string;
  size?: Size;
  /**
   * Where the avatar's dimensions come from.
   *
   * - `"size"` (default) — from {@link AvatarProps.size}, as a standalone avatar
   *   should.
   * - `"container"` — from the caller's own class, for a row that publishes a tile
   *   size of its own. A list row sets `--row-media` and its entity tiles read it via
   *   `sized-row-media`; an avatar in that row has to be the same square, or a
   *   listing of people and a listing of things render the same slot at two sizes.
   *
   * This is a prop rather than something a caller can do with `className`, and that
   * is the point: `size` otherwise emits `sized-height sized-width`, which is the same
   * utility family as `sized-row-media`. Both would apply and the winner would be
   * decided by their order in the compiled stylesheet — so the caller's class looks
   * applied, changes nothing, and the avatar silently keeps its intrinsic size.
   * `"container"` omits Avatar's own pair so there is exactly one source of the
   * dimensions.
   *
   * `size` still drives the fallback's type scale, so an avatar sized by its
   * container should still be passed the size its text should read at.
   */
  sizing?: "size" | "container";
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
      "aria-label": ariaLabel,
      icon,
      size = Size.Md,
      sizing = "size",
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
      : // `display: contents`, so the status-less wrapper adds no box of its own.
        //
        // It is a layout fix, not tidiness. Without it this div sits between the
        // caller's box and the avatar's root while carrying no height, so a root asking
        // for `size-full` resolves 100% against an auto-height parent and collapses to
        // its content — an avatar told to fill a 155px card came out 40px tall. A fixed
        // `size` never showed this, because it never asks its parent anything; only a
        // container-sized avatar does, which is why it surfaced the moment listings
        // started filling their own boxes.
        { className: "contents" };

    return (
      <Wrapper {...wrapperProps}>
        <AvatarPrimitive.Root
          ref={ref}
          onClick={onClick}
          role={onClick ? "button" : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={
            onClick
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }
              : undefined
          }
          aria-label={ariaLabel}
          className={clsx(
            variant,
            "rounded-sm",
            size,
            // Omitted entirely under `sizing: "container"` — see the prop's doc on why
            // this cannot be left in and overridden from `className`.
            sizing === "size" && "sized-height sized-width",
            className,
          )}
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
              // Gated with the root's pair, not independently: a fallback or image left
              // at its intrinsic size inside a container-sized root overflows the box it
              // is meant to fill.
              sizing === "size" && "sized-height sized-width",
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
              // No foreground named here. Which fill this ends up with depends on
              // `onClick` — `variant-responsive-bg` when clickable, `variant-static-bg`
              // when not — and only one of those has a hover state. Each declares its
              // own foreground, so the pair stays consistent either way.
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
                "variant-static-bg outline -outline-offset-1 outline-white/25 dark:outline-black/25",
              visuals === "inverted-border" && onClick && "variant-responsive-persistent-outline",
              visuals === "inverted-border" && !onClick && "variant-static-persistent-outline",
              sizing === "size" && "sized-height sized-width",
              "sized-text",
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
