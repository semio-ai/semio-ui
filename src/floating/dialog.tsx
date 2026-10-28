import { useRef, type ReactNode, type MouseEvent } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { clsx } from "clsx";
import { Variant } from "../types";
import { Button } from "../buttons/button";
import { InsideDialogContext } from "./dialog-nesting";

export interface DialogProps {
  /**
   * Optional body. Omitted for the confirmation-only form, which is the
   * common case: the header's title/description carry the whole message and
   * `hasBody` skips the padded body band and its dividers entirely.
   */
  children?: ReactNode;
  open: boolean;
  title?: ReactNode;
  description?: string;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  /** Disable X, Escape and overlay dismissal while an action is in flight. */
  dismissDisabled?: boolean;
  /** Allow clicking the overlay to dismiss. Defaults to `false` for confirmations. */
  closeOnOverlayClick?: boolean;
  submitText?: string;
  cancelText?: string;
  onStateChange: (open: boolean) => void;
  onSubmit?: (event: MouseEvent | KeyboardEvent) => void | Promise<void>;
  onCancel?: (event: MouseEvent | KeyboardEvent) => void;
  variant?: Variant;
  /** Fixed medium width for report-like dialogs; default retains content sizing. */
  size?: "content" | "medium";
  /** Replaces the standard cancel/submit footer. Buttons here do not automatically close the dialog. */
  footer?: ReactNode;
  /**
   * Whether clicking the submit button should close the dialog
   * immediately through the guarded dismissal path. Default `true`. Set `false` for
   * async submit handlers (e.g. delete that hits the network) so the
   * dialog stays open while the work is in flight; the consumer is
   * then responsible for calling `onStateChange(false)` after the
   * promise resolves successfully and leaving the dialog open with an
   * inline error / toast on failure. See `Modal.closeOnSubmitClick`
   * for the same semantics.
   */
  closeOnSubmitClick?: boolean;
  /** Set false for a cancel action that changes a step without closing. Defaults to true. */
  closeOnCancelClick?: boolean;
  /** Custom container for the dialog portal. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
}

/**
 * A confirmation/alert dialog built on Base UI `AlertDialog`. Mirrors the
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
 * - **Footer** is rendered when `footer`, `onCancel` or `onSubmit` is set. It gets a
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
  cancelDisabled,
  dismissDisabled = false,
  closeOnOverlayClick = false,
  submitText = "Submit",
  cancelText = "Cancel",
  onStateChange,
  onSubmit,
  onCancel,
  variant,
  closeOnSubmitClick = true,
  closeOnCancelClick = true,
  portalContainer,
  size = "content",
  footer,
}: DialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
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
  const cancelButton = onCancel && (
    <Button
      ref={cancelRef}
      tabIndex={0}
      className="flex-1"
      variant={Variant.Default}
      onClick={onCancel}
      disabled={cancelDisabled}
    >
      {cancelText}
    </Button>
  );
  const hasFooter = footer != null || Boolean(onCancel || submitButton);
  const changeOpen = (next: boolean) => {
    if (!next && dismissDisabled) return;
    onStateChange(next);
  };
  return (
    <AlertDialog.Root open={open} onOpenChange={changeOpen}>
      <InsideDialogContext.Provider value>
        {/* Closing removes the portal immediately; only the entrance is animated. */}
        {open && (
          <AlertDialog.Portal container={portalContainer ?? undefined}>
            <AlertDialog.Backdrop
              // A confirmation opened from a Modal dims that Modal too. Base UI draws a
              // nested dialog's backdrop only when forced.
              forceRender
              className={clsx(
                "fixed top-0 right-0 bottom-0 left-0",
                "p-0 bg-black/40 transition-opacity",
              )}
            />
            <AlertDialog.Viewport
              onClick={(event) => {
                if (closeOnOverlayClick && event.target === event.currentTarget) changeOpen(false);
              }}
              className="fixed inset-0 grid place-items-center p-0"
            >
              <AlertDialog.Popup
                // The closing footer Cancel owns initial focus when rendered. A custom
                // footer replaces Cancel, so focus the header close button; a cancel
                // action that stays open also leaves initial focus on that button.
                initialFocus={() =>
                  footer == null && onCancel && closeOnCancelClick
                    ? cancelRef.current
                    : closeRef.current
                }
                render={(props, state) => (
                  <div {...props} data-state={state.open ? "open" : "closed"} />
                )}
                className={clsx(
                  "variant-scope",
                  variant,
                  "flex flex-col overflow-clip focus:outline-hidden",
                  "card animated-modal",
                  // Cap to the viewport so a long title can't push the dialog (and
                  // its close button) off-screen; the title then clips instead.
                  "h-fit max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)]",
                  size === "medium" ? "w-[36rem]" : "w-fit",
                )}
              >
                <div
                  className={clsx(
                    "flex shrink-0 flex-col gap-1 p-3",
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
                        "variant-scope variant-static-text min-w-0 overflow-hidden",
                      )}
                    >
                      {title}
                    </AlertDialog.Title>
                    <AlertDialog.Close
                      ref={closeRef}
                      disabled={dismissDisabled}
                      render={(props) => (
                        <Button
                          {...props}
                          tabIndex={0}
                          className="shrink-0"
                          variant={variant}
                          leftIcon="close"
                          altText="Close"
                        />
                      )}
                    />
                  </div>
                  <AlertDialog.Description className="text-sm/6 text-neutral-600 dark:text-neutral-400">
                    {description ?? ""}
                  </AlertDialog.Description>
                </div>

                {hasBody && (
                  <div
                    className={clsx(
                      "p-3 text-black dark:text-white",
                      size === "medium" ? "min-h-0 overflow-auto" : "flex-1 md:flex-none",
                    )}
                  >
                    {children}
                  </div>
                )}

                {hasFooter && (
                  <div
                    className={clsx(
                      "flex shrink-0 flex-wrap justify-end gap-3 p-3",
                      // Only divide from a body that actually exists; otherwise the
                      // header's `border-b` is already the separator above us.
                      hasBody && "border-t border-neutral-500/15",
                    )}
                  >
                    {footer ?? (
                      <>
                        {cancelButton &&
                          (closeOnCancelClick ? (
                            <AlertDialog.Close
                              disabled={cancelDisabled}
                              onClick={(event) => {
                                // Action handlers can cancel dismissal with preventDefault.
                                if (event.defaultPrevented) event.preventBaseUIHandler();
                              }}
                              render={cancelButton}
                            />
                          ) : (
                            cancelButton
                          ))}
                        {submitButton &&
                          (closeOnSubmitClick ? (
                            <AlertDialog.Close
                              disabled={submitDisabled}
                              onClick={(event) => {
                                // Action handlers can cancel dismissal with preventDefault.
                                if (event.defaultPrevented) event.preventBaseUIHandler();
                              }}
                              render={submitButton}
                            />
                          ) : (
                            submitButton
                          ))}
                      </>
                    )}
                  </div>
                )}
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        )}
      </InsideDialogContext.Provider>
    </AlertDialog.Root>
  );
}
