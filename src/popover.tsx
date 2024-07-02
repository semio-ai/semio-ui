import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Transition } from "@headlessui/react";
// import Button from "./shared/button";
import { IconX } from "@tabler/icons-react";
import { Variant } from "./types";
import { getBasicTextColor, getBorder } from "./variant-colors";

export interface PopoverProps {
  title?: string;
  trigger: ReactNode;
  content: ReactNode;
  open?: boolean;
  onStateChange?: (open: boolean) => void;
  variant?: Variant;
}

const Popover = ({
  title,
  trigger,
  content,
  open,
  onStateChange,
  variant,
}: PopoverProps) => {
  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root open={open} onOpenChange={onStateChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        {/* <Transition
          show={open}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        > */}
        {/* <div> */}
        <PopoverPrimitive.Content
          align="center"
          sideOffset={4}
          className={clsx(
            "PopoverContent",
            "z-50 w-48 p-4 shadow-md md:w-56",
            "bg-neutral-50/75 dark:bg-neutral-950/75 backdrop-blur-lg",
            "border-t-2 border-solid",
            // `border-${rootVariant[variant ?? Variant.WARNING]}-500`,
            getBorder(variant),
          )}
        >
          <PopoverPrimitive.Arrow
            className={clsx("fill-current", getBasicTextColor(variant))}
          />

          <div className="flex justify-between">
            <span>{title}</span>
          </div>
          {content}
        </PopoverPrimitive.Content>
        {/* </div>
        </Transition> */}
      </PopoverPrimitive.Root>
    </div>
  );
};

export { Popover };
