import type { ReactNode, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";

export interface StatusProps {
  variant?: Variant;
  size?: Size;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: ReactNode;
  text?: string;
  hidden?: boolean;
  className?: string;
}

export const Status = forwardRef(
  (
    {
      variant = Variant.Default,
      size = Size.Md,
      placement = "top-right",
      text,
      children,
      hidden,
      className,
    }: StatusProps,
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
            "responsive",
            "absolute rounded-full ring-2 ring-neutral-200 dark:ring-neutral-800",
            text
              ? "flex h-[10px] min-w-[10px] flex-row items-center justify-center p-1 text-[7px] font-bold text-[var(--on-standard-color)]"
              : "sized-status",
            "variant-static-bg",
            getPlacement(placement),
          )}
          style={text ? { width: text.length * 6 } : undefined}
        >
          {text}
        </div>
      </div>
    );
  },
);

Status.displayName = "Status";

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
