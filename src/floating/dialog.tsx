import { type ReactNode, type MouseEvent } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
import { Variant } from "../types";
import { Button } from "../buttons/button";

export interface DialogProps {
  children: ReactNode;
  open: boolean;
  title?: ReactNode;
  description?: string;
  submitDisabled?: boolean;
  submitText?: string;
  onStateChange: (open: boolean) => void;
  onSubmit?: (event: MouseEvent | KeyboardEvent) => void;
  onCancel?: (event: MouseEvent | KeyboardEvent) => void;
  variant?: Variant;
}

export function Dialog({
  children,
  open,
  title,
  description,
  submitDisabled,
  submitText = "Submit",
  onStateChange,
  onSubmit,
  onCancel,
  variant,
}: DialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onStateChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          forceMount
          className={clsx(
            "transition-opacity data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut",
            "fixed top-0 bottom-0 left-0 right-0 grid place-items-center",
            "backdrop-blur-[2px] p-0",
          )}
        >
          {/* </Transition> */}

          <AlertDialog.Content
            forceMount
            className={clsx(
              variant,
              "flex flex-col focus:outline-hidden",
              "card animated-modal",
              "max-h-screen w-fit h-fit",
            )}
          >
            <div className={clsx("flex flex-col gap-1 p-3", variant, "colored-text")}>
              <div className="flex flex-row items-center justify-between">
                <AlertDialog.Title className="text-base/7 font-medium flex align-center justify-between">
                  {title}
                </AlertDialog.Title>
                <AlertDialog.Cancel asChild>
                  <Button tabIndex={0} variant={variant} leftIcon={<IconX />} />
                </AlertDialog.Cancel>
              </div>
              <AlertDialog.Description className="text-sm/6 dark:text-white/50 text-black/50">
                {description ?? ""}
              </AlertDialog.Description>
            </div>

            <div className="flex-1 md:flex-none p-3 dark:text-white text-black">{children}</div>

            <div className="py-2 px-3 flex flex-row gap-3 justify-end">
              {onCancel && (
                <AlertDialog.Cancel asChild>
                  <Button
                    tabIndex={0}
                    variant={Variant.Default}
                    onClick={onCancel}
                    disabled={submitDisabled}
                  >
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
              )}
              {onSubmit && (
                <AlertDialog.Action asChild>
                  <Button
                    tabIndex={0}
                    variant={variant}
                    onClick={onSubmit}
                    disabled={submitDisabled}
                  >
                    {submitText}
                  </Button>
                </AlertDialog.Action>
              )}
            </div>
          </AlertDialog.Content>
        </AlertDialog.Overlay>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
