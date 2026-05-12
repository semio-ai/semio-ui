import { type ReactNode, type MouseEvent } from "react";
import { Dialog } from "radix-ui";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
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
   * - `true` (default) — wraps the submit button in `Dialog.Close`. The
   *   modal closes synchronously on click, regardless of whether
   *   `onSubmit` is sync or async. Suitable for handlers that don't need
   *   to keep the modal open (sync state writes, fire-and-forget uploads).
   * - `false` — renders the submit button as a regular button. The modal
   *   stays open after the click; the consumer is responsible for
   *   eventually calling `onStateChange(false)` (typically after a
   *   successful `await` of the submit work). On error, the consumer
   *   should leave the modal open and surface the error inline so the
   *   user can retry.
   *
   * Cancel and the X close button always close immediately regardless of
   * this prop — async cancel is rare and "discard my work" should be
   * instant. Use `dismissDisabled` to lock those out during an
   * in-flight submit.
   */
  closeOnSubmitClick?: boolean;
}

/**
 * A flexible modal dialog component built on top of Radix UI's Dialog primitive.
 *
 * This component provides a full-screen overlay modal with customizable header, content area,
 * and footer. It includes automatic scroll handling, responsive design, and smooth animations.
 * The modal can be configured with submit/cancel actions and supports custom content placement
 * in the header area.
 *
 * Features:
 * - Full-screen overlay with backdrop blur
 * - Responsive design (full-screen on mobile, centered on desktop)
 * - Automatic scroll area with header and footer
 * - Customizable header with title, description, and additional content
 * - Optional submit/cancel footer with configurable actions
 * - Keyboard and click-away dismissal (configurable)
 * - Smooth fade animations for open/close states
 * - Variant-based styling support
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal
 *   open={isOpen}
 *   onStateChange={setIsOpen}
 *   title="Edit Settings"
 *   description="Modify your application settings below"
 *   headerBottom={<CustomTabs />}
 *   submitText="Save Changes"
 *   onSubmit={(event) => handleSave()}
 *   onCancel={(event) => setIsOpen(false)}
 *   variant={Variant.Primary}
 * >
 *   <SettingsForm />
 * </Modal>
 * ```
 *
 * @param children - Main content to display in the modal body
 * @param open - Controls whether the modal is visible
 * @param title - Optional title displayed in the header
 * @param description - Optional description text below the title
 * @param headerBottom - Optional content rendered below description but within header area
 * @param dismissDisabled - When true, prevents closing modal via ESC key or click-away
 * @param submitDisabled - When true, disables the submit button
 * @param submitText - Text for the submit button (defaults to "Submit")
 * @param onStateChange - Callback fired when modal should open/close
 * @param onSubmit - Optional callback for submit button click (shows submit button when provided)
 * @param onCancel - Optional callback for cancel button click (shows cancel button when provided)
 * @param variant - Visual variant for styling the modal and buttons
 * @param scrollDisabled - Legacy prop for disabling scroll area (currently unused)
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
  const submitButton = onSubmit && (
    <Button
      tabIndex={0}
      variant={variant}
      onClick={onSubmit}
      disabled={submitDisabled}
    >
      {submitText}
    </Button>
  );
  const showFooter = onSubmit || onCancel;
  const showHeader = title || description;
  return (
    <Dialog.Root open={open} onOpenChange={!dismissDisabled ? onStateChange : undefined}>
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          className={clsx(
            "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut transition-opacity",
            "fixed top-0 right-0 bottom-0 left-0 grid place-items-center",
            "p-0 bg-black/40",
          )}
        >
          <Dialog.Content
            forceMount
            className={clsx(
              "responsive flex flex-col focus:outline-hidden",
              "card animated-modal overflow-clip",
              variant,
              "h-[calc(100dvh-4px)] w-[calc(100vw-4px)]",
              "desktop:max-w-[calc(100vw-4px)] desktop:max-h-[calc(100dvh-4px)]",
              "desktop:min-h-72 desktop:min-w-96",
              "desktop:h-fit desktop:w-fit",
            )}
            // Don't dismiss the modal when a click originates inside a
            // base-ui popup (Autocomplete, Combobox, etc.). Those popups
            // portal to body, so Radix treats their clicks as "outside"
            // by default — selecting an item would close the modal AND
            // swallow the option's onClick. Detect via the
            // `data-base-ui-portal` attribute that FloatingPortal sets
            // on its portal node.
            onInteractOutside={(event) => {
              const target = event.detail.originalEvent.target as Element | null;
              if (target?.closest("[data-base-ui-portal]")) {
                event.preventDefault();
              }
            }}
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
                        <Dialog.Close asChild>
                          <Button variant={variant} leftIcon={<IconX />} />
                        </Dialog.Close>
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
                      <Dialog.Close asChild>
                        <Button
                          tabIndex={0}
                          variant={Variant.Default}
                          onClick={onCancel}
                          disabled={dismissDisabled}
                        >
                          Cancel
                        </Button>
                      </Dialog.Close>
                    )}
                    {submitButton &&
                      (closeOnSubmitClick ? (
                        <Dialog.Close asChild>{submitButton}</Dialog.Close>
                      ) : (
                        submitButton
                      ))}
                  </div>
                )
              }
            >
              <div className="flex-1 p-0 text-black md:flex-none dark:text-white">{children}</div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
