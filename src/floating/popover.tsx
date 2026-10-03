import { Popover as PopoverPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant } from "../types";
import { Arrow } from "./arrow";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onStateChange?: (open: boolean) => void;
  variant?: Variant;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

function Popover({
  trigger,
  children,
  open,
  onStateChange,
  variant,
  portalContainer,
}: PopoverProps) {
  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root open={open} onOpenChange={onStateChange}>
        <PopoverPrimitive.Trigger asChild className="focus:outline-none">
          {trigger}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal container={portalContainer ?? undefined}>
          <PopoverPrimitive.Content
            align="center"
            sideOffset={4}
            className={clsx(
              variant,
              "popover-content focus:outline-none",
              "variant-scope card-overlay",
              "m-0.5 min-w-55 rounded-sm",
            )}
          >
            <PopoverPrimitive.Arrow asChild width={12} height={6}>
              <Arrow filled={false} variant={variant ?? Variant.Default} />
            </PopoverPrimitive.Arrow>
            {children}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export { Popover };
