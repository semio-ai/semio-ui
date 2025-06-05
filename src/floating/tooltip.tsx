import { Tooltip as TooltipPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Size, Variant } from "../types";
import { Arrow } from "./arrow";

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
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [open, setOpen] = useState(controlledState?.[0] ?? false);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (controlledState) {
        controlledState[1](value);
      } else {
        setOpen(value);
      }
      setDefaultOpen(value);
    },
    [controlledState],
  );

  useEffect(() => {
    if (controlledState) {
      setOpen(controlledState[0]);
    } else {
      setOpen(defaultOpen);
    }
  }, [controlledState, defaultOpen]);

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <TooltipPrimitive.Trigger disabled={disabled} asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={clsx(
              Size.Sm as string,
              "responsive",
              "sized-text",
              "tooltip-content",
              "select-none inline-flex items-center px-2 py-0.5",
              invert ? "dark:text-black text-white card-invert" : "variant-static-text card",
              variant,
              "z-10",
            )}
          >
            <TooltipPrimitive.Arrow asChild width={12} height={6}>
              <Arrow filled={invert ?? false} variant={variant ?? Variant.Default} />
            </TooltipPrimitive.Arrow>
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
