import { CSSProperties, ReactNode } from "react";
import { Separator as RadixSeparator } from "radix-ui";
import { clsx } from "clsx";
import { Variant } from "../types";

export interface SeparatorProps {
  children?: ReactNode;
  variant?: Variant;
  color?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({
  children,
  variant,
  color,
  orientation = "horizontal",
  className,
}: SeparatorProps) {
  if (children) {
    return (
      <div
        className={clsx(
          "flex items-center gap-2",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
        style={
          {
            "--custom-color": color,
          } as CSSProperties
        }
      >
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            color ? "custom-color" : variant,
            "variant-separator-fill responsive",
          )}
        />
        {children}
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            color ? "custom-color" : variant,
            "variant-separator-fill responsive",
          )}
        />
      </div>
    );
  } else {
    return (
      <RadixSeparator.Root
        style={
          {
            "--custom-color": color,
          } as CSSProperties
        }
        orientation={orientation}
        className={clsx(
          "data-[orientation=horizontal]:h-[1px] data-[orientation=vertical]:w-[1px]",
          // "data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
          color ? "custom-color" : variant,
          "variant-separator-fill responsive",
          className,
        )}
      />
    );
  }
}
