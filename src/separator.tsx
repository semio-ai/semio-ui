import { ReactNode } from "react";
import * as RadixSeparator from "@radix-ui/react-separator";
import { clsx } from "clsx";
import { Variant } from "./types";
import { getSeparatorStyle } from "./style-functions";

export interface SeparatorProps {
  children?: ReactNode;
  variant?: Variant;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({
  children,
  variant,
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
      >
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            getSeparatorStyle(variant),
          )}
        />
        {children}
        <RadixSeparator.Root
          orientation={orientation}
          className={clsx(
            "flex flex-1 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
            getSeparatorStyle(variant),
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
          getSeparatorStyle(variant),
        )}
      />
    );
  }
}
