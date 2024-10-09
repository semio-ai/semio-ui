import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant } from "./types";
import { getBasicTextColor, getBorder } from "./style-functions";

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
              "PopoverContent",
              "w-96 p-4 shadow-md",
              "bg-neutral-50 dark:bg-neutral-950 backdrop-blur-lg",
              "border-t-2 border-solid",
              // `border-${rootVariant[variant ?? Variant.WARNING]}-500`,
              getBorder(variant),
            )}
          >
            <PopoverPrimitive.Arrow className={clsx("fill-current", getBasicTextColor(variant))} />

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
