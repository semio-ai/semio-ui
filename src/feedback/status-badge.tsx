import type { ReactNode, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";

export interface StatusBadgeProps {
  variant?: Variant;
  size?: Size;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: ReactNode;
  text?: string;
  hidden?: boolean;
  className?: string;
}

export const StatusBadge = forwardRef(
  (
    {
      variant = Variant.Default,
      size = Size.Md,
      placement = "top-right",
      text,
      children,
      hidden,
      className,
    }: StatusBadgeProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    if (hidden) {
      return children;
    }
    return (
      <div ref={ref} className={clsx("relative", className)}>
        {children}
        <div
          className={clsx(
            variant,
            size,
            "variant-scope",
            "absolute rounded-full ring-2 ring-neutral-200 dark:ring-neutral-800",
            // Two forms, two scales. The dot is sized as a mark; the counted form is
            // sized by the numeral it holds, so its height, type and padding all come
            // from `sized-status-text` rather than being fixed. Fixed values ignored
            // `size` entirely and left 7px type in a 2px content box.
            //
            // 600 rather than 700: at this size the heavier weight closes up the
            // counters. Safe to ask for even where a font ships no semibold — CSS
            // resolves a request above 500 upward, so it lands on 700, a heavier
            // glyph rather than a broken one. Requesting 500 would be the unsafe
            // direction: it resolves DOWNWARD, to 400.
            text
              ? "sized-status-text flex flex-row items-center justify-center font-semibold text-[var(--on-standard-color)]"
              : "sized-status",
            "variant-static-bg",
            getPlacement(placement),
          )}
        >
          {text}
        </div>
      </div>
    );
  },
);

StatusBadge.displayName = "StatusBadge";

function getPlacement(
  placement: "top-left" | "top-right" | "bottom-left" | "bottom-right",
): string {
  switch (placement) {
    case "top-left":
      return "top-0 left-0";
    case "top-right":
      return "top-0 right-0";
    case "bottom-left":
      return "bottom-0 left-0";
    case "bottom-right":
      return "bottom-0 right-0";
  }
}
