import type { ReactNode, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { Variant } from "./types";
import { getBasicBgColor } from "./style-functions";

export interface StatusProps {
  variant?: Variant;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: ReactNode;
  text?: string;
  hidden?: boolean;
}

export const Status = forwardRef(
  (
    { variant = Variant.Default, placement = "top-right", text, children, hidden }: StatusProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    if (hidden) {
      return children;
    }
    return (
      <div ref={ref} className="relative">
        {children}
        <div
          className={clsx(
            "rounded-full absolute ring-2 dark:ring-neutral-800 ring-neutral-200",
            text
              ? "h-[10px] min-w-[10px] text-[7px] p-[1] dark:text-black text-white font-bold flex flex-row items-center justify-center"
              : "h-[10px] w-[10px]",
            variant === Variant.Default
              ? "dark:bg-neutral-50 bg-neutral-950"
              : getBasicBgColor(variant),
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
