import { type ReactNode, type MouseEvent } from "react";
import { AlertDialog } from "radix-ui";
import { clsx } from "clsx";
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

/**
 * A confirmation/alert dialog built on Radix `AlertDialog`. Mirrors the
 * structure of `Modal` — header (title + optional description + X close),
 * optional body, optional footer (cancel/submit) — and shares its visual
 * language (frosted card, `bg-black/40` overlay, hairline section dividers).
 *
 * Layout sections and dividers:
 * - **Header** is always rendered. It carries title, description (subtitle),
 *   and the X close button. Has `border-b` only when a body or footer
 *   follows — a header by itself doesn't need a dangling underline.
 * - **Body** is rendered only when `children` is truthy. When absent (the
 *   common confirmation-only case), the empty padded area is skipped and
 *   no body-adjacent dividers are drawn.
 * - **Footer** is rendered when `onCancel` or `onSubmit` is set. It gets a
 *   `border-t` only when a body sits above it; otherwise the header's
 *   `border-b` already separates them and a second hairline would read as
 *   a double line.
 *
 * @example Confirmation-only (no body)
 * ```tsx
 * <Dialog
 *   open={open}
 *   onStateChange={setOpen}
 *   title="Delete project?"
 *   description="This cannot be undone."
 *   submitText="Delete"
 *   variant={Variant.Error}
 *   onSubmit={handleDelete}
 *   onCancel={() => setOpen(false)}
 * />
 * ```
 *
 * @example With body content
 * ```tsx
 * <Dialog title="Remove items" submitText="Remove" {...handlers}>
 *   <ul className="list-disc pl-5 text-sm">
 *     {items.map((i) => <li key={i.id}>{i.name}</li>)}
 *   </ul>
 * </Dialog>
 * ```
 */
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
  const hasBody = Boolean(children);
  const hasFooter = Boolean(onCancel || submitButton);
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
              // Cap to the viewport so a long title can't push the dialog (and
              // its close button) off-screen; the title then clips instead.
              "h-fit max-h-screen w-fit max-w-[calc(100vw-1rem)]",
            )}
          >
            <div
              className={clsx(
                "flex flex-col gap-1 p-3",
                // Header gets a bottom divider only when something follows
                // it. A solo header (no body, no footer — uncommon) reads
                // cleaner without a dangling underline.
                (hasBody || hasFooter) && "border-b border-neutral-500/15",
                variant,
                "variant-static-text",
              )}
            >
              <div className="flex flex-row items-center justify-between">
                <AlertDialog.Title
                  className={clsx(
                    variant,
                    "flex items-center text-base/7 font-medium whitespace-nowrap",
                    // `min-w-0` + `overflow-hidden` let a long title clip instead
                    // of forcing the dialog wider than the viewport (which pushed
                    // the close button off-screen); `whitespace-nowrap` still keeps
                    // short titles on a single line.
                    "responsive variant-static-text min-w-0 overflow-hidden",
                  )}
                >
                  {title}
                </AlertDialog.Title>
                <AlertDialog.Cancel asChild>
                  <Button
                    tabIndex={0}
                    className="shrink-0"
                    variant={variant}
                    leftIcon="close"
                    altText={cancelText}
                  />
                </AlertDialog.Cancel>
              </div>
              <AlertDialog.Description className="text-sm/6 text-neutral-600 dark:text-neutral-400">
                {description ?? ""}
              </AlertDialog.Description>
            </div>

            {hasBody && (
              <div className="flex-1 p-3 text-black md:flex-none dark:text-white">{children}</div>
            )}

            {hasFooter && (
              <div
                className={clsx(
                  "flex flex-row justify-end gap-3 p-3",
                  // Only divide from a body that actually exists; otherwise the
                  // header's `border-b` is already the separator above us.
                  hasBody && "border-t border-neutral-500/15",
                )}
              >
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
            )}
          </AlertDialog.Content>
        </AlertDialog.Overlay>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
