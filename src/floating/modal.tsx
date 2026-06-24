import { type ReactNode, type MouseEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { ScrollArea } from "../layouts/scroll-area";
import { Variant } from "../types";
import { Button } from "../buttons/button";

export interface ModalProps {
  children: ReactNode;
  open: boolean;
  title?: string | ReactNode;
  description?: string | ReactNode;
  headerBottom?: ReactNode;
  dismissDisabled?: boolean;
  submitDisabled?: boolean;
  submitText?: string;
  onStateChange: (open: boolean) => void;
  onSubmit?: (event: MouseEvent) => void;
  onCancel?: (event: MouseEvent) => void;
  variant?: Variant;
  /**
   * Whether clicking the submit button should close the modal immediately.
   *
   * - `true` (default) — the modal closes synchronously on click, regardless
   *   of whether `onSubmit` is sync or async. Suitable for handlers that
   *   don't need to keep the modal open (sync state writes, fire-and-forget
   *   uploads).
   * - `false` — the modal stays open after the click; the consumer is
   *   responsible for eventually calling `onStateChange(false)` (typically
   *   after a successful `await` of the submit work). On error, leave the
   *   modal open and surface the error inline so the user can retry.
   *
   * Cancel and the X close button always close immediately regardless of
   * this prop — async cancel is rare and "discard my work" should be
   * instant. Use `dismissDisabled` to lock those out during an
   * in-flight submit.
   */
  closeOnSubmitClick?: boolean;
}

/**
 * A flexible modal dialog built on base-ui's `Dialog` primitive.
 *
 * Provides a full-screen overlay modal with customisable header, content
 * area, and footer. Includes automatic scroll handling, responsive
 * design, and smooth fade-and-slide animations. Submit/cancel actions
 * are configurable; custom content can be slotted into the header area
 * below the description.
 *
 * Why base-ui (not Radix): Radix's `DismissableLayer` treats clicks
 * inside other portals (e.g. base-ui's `Autocomplete` popup) as
 * "outside", which closed the modal *and* swallowed the popup's option
 * `onClick`. base-ui's `Dialog` and `Autocomplete` coordinate via the
 * `FloatingPortal` machinery and don't have that conflict.
 *
 * Features:
 * - Full-screen dim overlay on every breakpoint; centred card on desktop
 * - Responsive (full-bleed on mobile, fit-to-content on desktop)
 * - Automatic scroll area with header/footer hairline dividers
 * - Header with title, description, X close, and optional `headerBottom`
 * - Optional submit/cancel footer with configurable close semantics
 * - Keyboard (Esc) and click-away dismissal (configurable)
 * - Variant-based styling
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onStateChange={setIsOpen}
 *   title="Edit Settings"
 *   description="Modify your application settings below"
 *   submitText="Save Changes"
 *   onSubmit={() => handleSave()}
 *   onCancel={() => setIsOpen(false)}
 *   variant={Variant.Primary}
 * >
 *   <SettingsForm />
 * </Modal>
 * ```
 */
export function Modal({
  children,
  open,
  title,
  description,
  headerBottom,
  dismissDisabled = false,
  submitDisabled,
  submitText = "Submit",
  onStateChange,
  onSubmit,
  onCancel,
  variant,
  closeOnSubmitClick = true,
}: ModalProps) {
  const showFooter = onSubmit || onCancel;
  const showHeader = title || description;
  const submitButton = onSubmit && (
    <Button
      tabIndex={0}
      variant={variant}
      onClick={(event) => {
        onSubmit(event);
        if (closeOnSubmitClick) {
          onStateChange(false);
        }
      }}
      disabled={submitDisabled}
    >
      {submitText}
    </Button>
  );
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        // Honour `dismissDisabled` for every close reason (escape, outside
        // press, focus out). Open requests still propagate so a controlled
        // parent can `setOpen(true)` programmatically — though typically
        // the parent already manages `open` itself.
        if (dismissDisabled && !nextOpen) return;
        onStateChange(nextOpen);
      }}
      // Lock out pointer dismissal entirely when disabled; the
      // `onOpenChange` guard above covers escape/focus-out too.
      disablePointerDismissal={dismissDisabled}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={clsx(
            "fixed inset-0 bg-black/40",
            "transition-opacity duration-200",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
          )}
        />
        <Dialog.Viewport className="fixed inset-0 grid place-items-center p-0">
          <Dialog.Popup
            className={clsx(
              "responsive flex flex-col focus:outline-hidden",
              "card overflow-clip",
              variant,
              "h-[calc(100dvh-4px)] w-[calc(100vw-4px)]",
              "desktop:max-w-[calc(100vw-4px)] desktop:max-h-[calc(100dvh-4px)]",
              "desktop:min-h-72 desktop:min-w-96",
              "desktop:h-fit desktop:w-fit",
              // Slide-up + fade in, slide-down + fade out. Matches the
              // `animated-modal` keyframes that the Radix-backed version
              // used, expressed via base-ui's `data-starting-style` /
              // `data-ending-style` transition hooks.
              "transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "data-starting-style:opacity-0 data-starting-style:scale-90",
              "data-ending-style:opacity-0 data-ending-style:scale-90",
            )}
          >
            <ScrollArea
              orientation="vertical"
              className={clsx(
                "h-[calc(100dvh-4px)] w-[calc(100vw-4px)]",
                "desktop:max-w-[calc(100vw-4px)] desktop:max-h-[calc(100dvh-4px)]",
                "desktop:min-h-72 desktop:min-w-96",
                "desktop:h-fit desktop:w-fit",
              )}
              header={
                <div
                  className={clsx(
                    "flex flex-col gap-1",
                    !showHeader && "hidden",
                    "border-b border-neutral-500/15",
                  )}
                >
                  <div
                    className={clsx(headerBottom ? "px-3 pt-3 pb-0" : "p-3", "flex flex-col gap-1")}
                  >
                    <div className="flex flex-row items-center justify-between">
                      <Dialog.Title
                        className={clsx(
                          variant,
                          "align-center flex text-base/7 font-medium",
                          "responsive variant-static-text justify-between",
                        )}
                      >
                        {title}
                      </Dialog.Title>
                      {!dismissDisabled && (
                        <Dialog.Close
                          render={(props) => (
                            <Button {...props} variant={variant} leftIcon="close" />
                          )}
                        />
                      )}
                    </div>
                    <Dialog.Description className="text-sm/6 text-black/50 dark:text-white/50">
                      {description ?? ""}
                    </Dialog.Description>
                  </div>

                  {headerBottom}
                </div>
              }
              footer={
                showFooter && (
                  <div className="flex justify-end gap-3 p-3 border-t border-neutral-500/15">
                    {onCancel && (
                      <Button
                        tabIndex={0}
                        variant={Variant.Default}
                        onClick={(event) => {
                          onCancel(event);
                          onStateChange(false);
                        }}
                        disabled={dismissDisabled}
                      >
                        Cancel
                      </Button>
                    )}
                    {submitButton}
                  </div>
                )
              }
            >
              <div className="flex-1 p-0 text-black md:flex-none dark:text-white">{children}</div>
            </ScrollArea>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
