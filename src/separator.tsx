import { CSSProperties, ReactNode } from "react";
import * as RadixSeparator from "@radix-ui/react-separator";
import { clsx } from "clsx";
import { Variant } from "./types";

export interface SeparatorProps {
  children?: ReactNode;
  variant?: Variant | "custom" | "layout";
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
            "--custom-color": variant === "custom" && color ? color : undefined,
          } as CSSProperties
        }
      >
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            variant === "layout" && "dark:bg-layout-dark-separator/50 bg-layout-light-separator/50",
            color ? "custom-color" : variant,
            "responsive variant-separator-fill",
          )}
        />
        {children}
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            variant === "layout" && "dark:bg-layout-dark-separator/50 bg-layout-light-separator/50",
            color ? "custom-color" : variant,
            "responsive variant-separator-fill",
          )}
        />
      </div>
    );
  } else {
    return (
      <RadixSeparator.Root
        style={
          {
            "--custom-color": variant === "custom" && color ? color : undefined,
          } as CSSProperties
        }
        orientation={orientation}
        className={clsx(
          "flex data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
          variant === "layout" && "dark:bg-layout-dark-separator/50 bg-layout-light-separator/50",
          color ? "custom-color" : variant,
          "variant-separator-fill",
        )}
      />
    );
  }
}
