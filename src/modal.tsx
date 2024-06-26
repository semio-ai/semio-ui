import { type ReactNode, type MouseEvent } from "react";
import {
  Transition,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  CloseButton,
} from "@headlessui/react";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
import { Variant } from "./types";
import { getBorder, getHoverButtonStyles } from "./variant-colors";
import { TextButton } from "./buttons/text-button";

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
  variant?: Variant;
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
  variant,
}: ModalProps) {
  // let [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={onStateChange}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition show={open}>
            <DialogBackdrop className="transition fixed inset-0 duration-300 ease-in-out data-[closed]:bg-transparent bg-black/30" />
          </Transition>
          <DialogPanel
            transition
            className={clsx(
              "w-full max-w-md p-6 backdrop-blur-2xl",
              "transition ease-in-out duration-300",
              "data-[closed]:opacity-0",
              "data-[closed]:data-[enter]:translate-y-8",
              "data-[closed]:data-[leave]:translate-y-8",
              "bg-neutral-50/75 dark:bg-neutral-950/75",
              "border-t-2 border-solid",
              getBorder(variant),
            )}
          >
            <DialogTitle
              as="h3"
              className="text-base/7 font-medium dark:text-white text-black flex align-center justify-between"
            >
              {title}
              <CloseButton
                className="text-gray-500 dark:text-gray-400 w-7 h-7 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={(event) => {
                  event.preventDefault();
                  onStateChange(false);
                }}
              >
                <IconX />
              </CloseButton>
            </DialogTitle>
            <p className="mt-2 text-sm/6 dark:text-white/50 text-black/50">
              {description}
            </p>
            <div className="mt-4">{children}</div>
            <div className="mt-4 flex gap-3 justify-end">
              {onCancel && (
                <CloseButton
                  onClick={onCancel}
                  className={clsx(
                    "inline-flex select-none justify-center px-4 py-2 text-sm font-medium",
                    getHoverButtonStyles(Variant.DEFAULT),
                  )}
                >
                  Cancel
                </CloseButton>
              )}
              {onSubmit && (
                <CloseButton
                  disabled={submitDisabled}
                  onClick={onSubmit}
                  className={clsx(
                    submitDisabled && "opacity-50 cursor-not-allowed",
                    "inline-flex select-none justify-center px-4 py-2 text-sm font-medium",
                    getHoverButtonStyles(variant),
                  )}
                >
                  {submitText ?? "Submit"}
                </CloseButton>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
    // <DialogPrimitive.Root open={open} onOpenChange={onStateChange}>
    //   <DialogPrimitive.Portal forceMount>
    //     <Transition
    //       show={open}
    //       enter="ease-out duration-300"
    //       enterFrom="opacity-0"
    //       enterTo="opacity-100"
    //       leave="ease-in duration-200"
    //       leaveFrom="opacity-100"
    //       leaveTo="opacity-0"
    //     >
    //       <DialogPrimitive.Overlay
    //         forceMount
    //         className="fixed inset-0 z-20 bg-black/50"
    //       />
    //     </Transition>
    //     <Transition
    //       show={open}
    //       enter="ease-out duration-300"
    //       enterFrom="opacity-0 scale-95"
    //       enterTo="opacity-100 scale-100"
    //       leave="ease-in duration-200"
    //       leaveFrom="opacity-100 scale-100"
    //       leaveTo="opacity-0 scale-95"
    //     >
    //       <DialogPrimitive.Content
    //         forceMount
    //         className={clsx(
    //           "fixed z-50",
    //           "w-[95vw] max-w-md p-4 md:w-full",
    //           "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    //           "bg-neutral-50/75 dark:bg-neutral-950/75 backdrop-blur-lg",
    //           "border-t-2 border-solid",
    //           variant === Variant.PRIMARY
    //             ? "border-primary-500"
    //             : variant === Variant.SECONDARY
    //               ? "border-secondary-500"
    //               : variant === Variant.TERTIARY
    //                 ? "border-tertiary-500"
    //                 : variant === Variant.INFO
    //                   ? "border-info-500"
    //                   : variant === Variant.SUCCESS
    //                     ? "border-success-500"
    //                     : variant === Variant.WARNING
    //                       ? "border-warning-500"
    //                       : variant === Variant.ERROR
    //                         ? "border-error-500"
    //                         : "border-default-500",
    //         )}
    //       >
    //         <DialogPrimitive.Title className="text-lg capitalize font-medium text-gray-900 dark:text-gray-100 flex align-center justify-between">
    //           {title || "Modal"}
    //           <DialogPrimitive.Close
    //             className="text-gray-500 dark:text-gray-400 w-7 h-7 hover:text-gray-900 dark:hover:text-gray-100"
    //             asChild
    //             onClick={(event) => {
    //               event.preventDefault();
    //               onStateChange(false);
    //             }}
    //           >
    //             <IconX />
    //           </DialogPrimitive.Close>
    //         </DialogPrimitive.Title>
    //         <DialogPrimitive.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
    //           {description ?? "Active Modal Window"}
    //         </DialogPrimitive.Description>
    //         {children}

    //         <div className="mt-4 flex gap-3 justify-end">
    //           {onCancel && (
    //             <DialogPrimitive.Close
    //               onClick={onCancel}
    //               className={clsx(
    //                 "inline-flex select-none justify-center px-4 py-2 text-sm font-medium",
    //                 "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:text-gray-100 dark:hover:bg-purple-600",
    //                 "border border-transparent",
    //                 "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
    //               )}
    //             >
    //               Cancel
    //             </DialogPrimitive.Close>
    //           )}
    //           {onSubmit && (
    //             <DialogPrimitive.Close
    //               disabled={submitDisabled}
    //               onClick={onSubmit}
    //               className={clsx(
    //                 submitDisabled && "opacity-50 cursor-not-allowed",
    //                 "inline-flex select-none justify-center px-4 py-2 text-sm font-medium",
    //                 "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:text-gray-100 dark:hover:bg-purple-600",
    //                 "border border-transparent",
    //                 "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
    //               )}
    //             >
    //               {submitText ?? "Submit"}
    //             </DialogPrimitive.Close>
    //           )}
    //         </div>
    //       </DialogPrimitive.Content>
    //     </Transition>
    //   </DialogPrimitive.Portal>
    // </DialogPrimitive.Root>
  );
}
