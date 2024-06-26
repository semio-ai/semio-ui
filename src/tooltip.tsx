import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Variant } from "./types";

export interface TooltipProps {
  target: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  controlledState?: [boolean, (value: boolean) => void];
  variant?: Variant;
}

const Tooltip = ({
  target,
  children,
  side,
  controlledState,
  variant,
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        open={controlledState?.[0]}
        onOpenChange={controlledState?.[1]}
      >
        <TooltipPrimitive.Trigger asChild>{target}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side={side ?? "top"}
          sideOffset={4}
          className={clsx(
            "radix-side-top:animate-slide-down-fade",
            "radix-side-right:animate-slide-left-fade",
            "radix-side-bottom:animate-slide-up-fade",
            "radix-side-left:animate-slide-right-fade",
            "inline-flex items-center px-4 py-2.5",
            "bg-tertiary-500",
          )}
        >
          <TooltipPrimitive.Arrow className="fill-current text-white dark:text-gray-800" />
          {children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export { Tooltip };
