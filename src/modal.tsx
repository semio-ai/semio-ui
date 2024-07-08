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
              "bg-neutral-50/85 dark:bg-neutral-950/85",
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
                    getHoverButtonStyles(Variant.Default),
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
  );
}
