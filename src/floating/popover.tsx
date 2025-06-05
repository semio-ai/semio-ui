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
}

function Popover({ trigger, children, open, onStateChange, variant }: PopoverProps) {
  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root open={open} onOpenChange={onStateChange}>
        <PopoverPrimitive.Trigger asChild className="focus:outline-none">
          {trigger}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="center"
            sideOffset={4}
            className={clsx(
              variant,
              "popover-content focus:outline-none",
              "responsive card",
              "rounded-sm min-w-[220px] m-0.5",
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
