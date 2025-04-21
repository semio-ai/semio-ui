import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Variant } from "./types";
import { getBasicTextColor, getBorder, getTooltipTextColor } from "./style-functions";
import { AnimatePresence } from "motion/dist/react";

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
            sideOffset={6}
            className={clsx(
              "tooltip-content",
              "select-none inline-flex items-center px-2 py-0.5",
              invert ? "text-black card-invert" : "colored-text card",
              variant,
              "z-10",
            )}
          >
            <TooltipPrimitive.Arrow
              width={12}
              height={6}
              className={clsx(
                "fill-current",
                invert ? "colored-carrot-invert" : "colored-carrot",
                variant,
              )}
            />
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
