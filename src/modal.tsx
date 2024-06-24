import { type ReactNode, type MouseEvent } from "react";
import { Transition } from "@headlessui/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";

export interface ModalProps {
  children: ReactNode;
  open: boolean;
  title?: string;
  description?: string;
  submitDisabled?: boolean;
  submitText?: string;
  onStateChange: (open: boolean) => void;
  onSubmit?: (event: MouseEvent) => void;
  onCancel?: (event: MouseEvent) => void;
}

export function Modal({
  children,
  open,
  title,
  description,
  submitDisabled,
  submitText,
  onStateChange,
  onSubmit,
  onCancel,
}: ModalProps) {
  // let [isOpen, setIsOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onStateChange}>
      <DialogPrimitive.Portal forceMount>
        <Transition
          show={open}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div>
            <DialogPrimitive.Overlay
              forceMount
              className="fixed inset-0 z-20 bg-black/50"
            />
            <DialogPrimitive.Content
              forceMount
              className={clsx(
                "fixed z-50",
                "w-[95vw] max-w-md p-4 md:w-full",
                "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "bg-neutral-50/75 dark:bg-neutral-950/75 backdrop-blur-lg",
                "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                "border-t-2 border-solid border-semio-yellow",
              )}
            >
              <DialogPrimitive.Title className="text-lg capitalize font-medium text-gray-900 dark:text-gray-100 flex align-center justify-between">
                {title || "Modal"}
                <DialogPrimitive.Close
                  className="text-gray-500 dark:text-gray-400 w-7 h-7 hover:text-gray-900 dark:hover:text-gray-100"
                  asChild
                  onClick={(event) => {
                    event.preventDefault();
                    onStateChange(false);
                  }}
                >
                  <IconX />
                </DialogPrimitive.Close>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {description ?? "Active Modal Window"}
              </DialogPrimitive.Description>
              {children}

              <div className="mt-4 flex gap-3 justify-end">
                {onCancel && (
                  <DialogPrimitive.Close
                    onClick={onCancel}
                    className={clsx(
                      "inline-flex select-none justify-center px-4 py-2 text-sm font-medium",
                      "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:text-gray-100 dark:hover:bg-purple-600",
                      "border border-transparent",
                      "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                    )}
                  >
                    Cancel
                  </DialogPrimitive.Close>
                )}
                {onSubmit && (
                  <DialogPrimitive.Close
                    disabled={submitDisabled}
                    onClick={onSubmit}
                    className={clsx(
                      submitDisabled && "opacity-50 cursor-not-allowed",
                      "inline-flex select-none justify-center px-4 py-2 text-sm font-medium",
                      "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:text-gray-100 dark:hover:bg-purple-600",
                      "border border-transparent",
                      "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                    )}
                  >
                    {submitText ?? "Submit"}
                  </DialogPrimitive.Close>
                )}
              </div>
            </DialogPrimitive.Content>
          </div>
        </Transition>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
