import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Variant } from "./types";
import { getBasicTextColor, getBorder, getTooltipTextColor } from "./style-functions";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  controlledState?: [boolean, (value: boolean) => void];
  variant?: Variant;
  disabled?: boolean;
  invert?: boolean;
}

function Tooltip({
  content,
  children,
  side,
  controlledState,
  variant,
  disabled,
  invert,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={controlledState?.[0]} onOpenChange={controlledState?.[1]}>
        <TooltipPrimitive.Trigger disabled={disabled} asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={4}
            className={clsx(
              "data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade",
              "data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade",
              "data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade",
              "data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade",
              "select-none inline-flex items-center px-2 py-0.5",
              !invert && "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg shadow-md",
              invert && "bg-neutral-500/50 dark:bg-neutral-500/50 backdrop-blur-lg shadow-md",
              "data-[side=bottom]:border-t-2 border-solid",
              "data-[side=top]:border-b-2 border-solid",
              "data-[side=right]:border-l-2 border-solid",
              "data-[side=left]:border-r-2 border-solid",
              "z-[10]",
              getBorder(variant),
              getTooltipTextColor(variant, invert),
            )}
          >
            <TooltipPrimitive.Arrow className={clsx("fill-current", getBasicTextColor(variant))} />
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
