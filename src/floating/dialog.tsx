import { type ReactNode, type MouseEvent } from "react";
import { AlertDialog } from "radix-ui";
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
  cancelText?: string;
  onStateChange: (open: boolean) => void;
  onSubmit?: (event: MouseEvent | KeyboardEvent) => void | Promise<void>;
  onCancel?: (event: MouseEvent | KeyboardEvent) => void;
  variant?: Variant;
  /**
   * Whether clicking the submit button should close the dialog
   * immediately. Default `true` — wraps the submit button in
   * `AlertDialog.Action`, matching historic behavior. Set `false` for
   * async submit handlers (e.g. delete that hits the network) so the
   * dialog stays open while the work is in flight; the consumer is
   * then responsible for calling `onStateChange(false)` after the
   * promise resolves successfully and leaving the dialog open with an
   * inline error / toast on failure. See `Modal.closeOnSubmitClick`
   * for the same semantics.
   */
  closeOnSubmitClick?: boolean;
}

export function Dialog({
  children,
  open,
  title,
  description,
  submitDisabled,
  submitText = "Submit",
  cancelText = "Cancel",
  onStateChange,
  onSubmit,
  onCancel,
  variant,
  closeOnSubmitClick = true,
}: DialogProps) {
  const submitButton = onSubmit && (
    <Button
      tabIndex={0}
      className="flex-1"
      variant={variant}
      onClick={(event) => {
        const fn = async (e: MouseEvent) => {
          if (typeof onSubmit === "function") {
            await onSubmit(e);
          }
        };
        void fn(event);
      }}
      disabled={submitDisabled}
    >
      {submitText}
    </Button>
  );
  return (
    <AlertDialog.Root open={open} onOpenChange={onStateChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          forceMount
          className={clsx(
            "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut transition-opacity",
            "fixed top-0 right-0 bottom-0 left-0 grid place-items-center",
            "p-0 bg-black/40",
          )}
        >
          <AlertDialog.Content
            forceMount
            className={clsx(
              "responsive",
              variant,
              "flex flex-col overflow-clip focus:outline-hidden",
              "card animated-modal",
              "h-fit max-h-screen w-fit",
            )}
          >
            <div
              className={clsx(
                "flex flex-col gap-1 bg-neutral-50/50 p-3 dark:bg-neutral-950/50",
                variant,
                "variant-static-text",
              )}
            >
              <div className="flex flex-row items-center justify-between">
                <AlertDialog.Title
                  className={clsx(
                    variant,
                    "align-center flex text-base/7 font-medium",
                    "responsive variant-static-text justify-between",
                  )}
                >
                  {title}
                </AlertDialog.Title>
                <AlertDialog.Cancel asChild>
                  <Button
                    tabIndex={0}
                    variant={variant}
                    leftIcon={<IconX />}
                    altText={cancelText}
                  />
                </AlertDialog.Cancel>
              </div>
              <AlertDialog.Description className="text-sm/6 text-neutral-600 dark:text-neutral-400">
                {description ?? ""}
              </AlertDialog.Description>
            </div>

            <div className="flex-1 p-3 text-black md:flex-none dark:text-white">{children}</div>

            <div className="flex flex-row justify-end gap-3 p-3">
              {onCancel && (
                <AlertDialog.Cancel asChild>
                  <Button
                    tabIndex={0}
                    className="flex-1"
                    variant={Variant.Default}
                    onClick={onCancel}
                  >
                    {cancelText ?? "Cancel"}
                  </Button>
                </AlertDialog.Cancel>
              )}
              {submitButton &&
                (closeOnSubmitClick ? (
                  <AlertDialog.Action asChild>{submitButton}</AlertDialog.Action>
                ) : (
                  submitButton
                ))}
            </div>
          </AlertDialog.Content>
        </AlertDialog.Overlay>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
