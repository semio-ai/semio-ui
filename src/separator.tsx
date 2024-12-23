import { CSSProperties, ReactNode } from "react";
import * as RadixSeparator from "@radix-ui/react-separator";
import { clsx } from "clsx";
import { Variant } from "./types";
import { getSeparatorStyle } from "./style-functions";

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
            "--separator-color": variant === "custom" && color ? color : undefined,
          } as CSSProperties
        }
      >
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            variant === "layout"
              ? "dark:bg-layout-darksep/50 bg-layout-lightsep/50"
              : getSeparatorStyle(variant),
          )}
        />
        {children}
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            variant === "layout"
              ? "dark:bg-layout-darksep/50 bg-layout-lightsep/50"
              : getSeparatorStyle(variant),
          )}
        />
      </div>
    );
  } else {
    return (
      <RadixSeparator.Root
        orientation={orientation}
        className={clsx(
          "flex data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
          variant === "layout"
            ? "dark:bg-layout-darksep/50 bg-layout-lightsep/50"
            : getSeparatorStyle(variant),
        )}
      />
    );
  }
}
