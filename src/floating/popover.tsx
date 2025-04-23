import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant } from "../types";
import { Arrow } from "./arrow";

export interface PopoverProps {
  title?: string;
  trigger: ReactNode;
  content: ReactNode;
  open?: boolean;
  onStateChange?: (open: boolean) => void;
  variant?: Variant;
}

function Popover({ title, trigger, content, open, onStateChange, variant }: PopoverProps) {
  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root open={open} onOpenChange={onStateChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="center"
            sideOffset={4}
            className={clsx(
              "popover-content",
              "colored-text card",
              "rounded-sm min-w-[220px] m-0.5",
              "w-96 p-4 shadow-md",
            )}
          >
            <PopoverPrimitive.Arrow asChild width={12} height={6}>
              <Arrow filled={false} variant={variant ?? Variant.Default} />
            </PopoverPrimitive.Arrow>

            {title ?? (
              <div className="flex justify-between">
                <span>{title}</span>
              </div>
            )}
            {content}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export { Popover };
