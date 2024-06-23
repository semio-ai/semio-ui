import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Transition } from "@headlessui/react";
// import Button from "./shared/button";
import { IconX } from "@tabler/icons-react";

export interface PopoverProps {
  title?: string;
  trigger: ReactNode;
  content: ReactNode;
  open?: boolean;
  onStateChange?: (open: boolean) => void;
}

const Popover = (props: PopoverProps) => {
  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root
        open={props.open}
        onOpenChange={props.onStateChange}
      >
        <PopoverPrimitive.Trigger asChild>
          {props.trigger}
        </PopoverPrimitive.Trigger>
        <Transition
          show={props.open}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0.5"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0.5"
          leaveTo="opacity-0 translate-y-2"
        >
          <div>
            <PopoverPrimitive.Content
              align="center"
              sideOffset={4}
              className={clsx(
                "z-50 w-48 p-4 shadow-md md:w-56",
                "border-t-2 border-solid border-semio-yellow",
                "bg-neutral-50 dark:bg-neutral-950",
              )}
            >
              <PopoverPrimitive.Arrow className="fill-current text-semio-yellow" />

              <div className="flex justify-between">
                <span>{props.title}</span>
                <PopoverPrimitive.Close
                  className={clsx(
                    "text-gray-500 dark:text-gray-400 w-7 h-7 hover:text-gray-900 dark:hover:text-gray-100",
                  )}
                >
                  <IconX />
                </PopoverPrimitive.Close>
              </div>
              {props.content}
            </PopoverPrimitive.Content>
          </div>
        </Transition>
      </PopoverPrimitive.Root>
    </div>
  );
};

export { Popover };
