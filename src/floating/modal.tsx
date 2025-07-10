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
  scrollDisabled?: boolean;
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
}: ModalProps) {
  const showFooter = onSubmit || onCancel;
  const showHeader = title || description;
  return (
    <Dialog.Root open={open} onOpenChange={!dismissDisabled ? onStateChange : undefined}>
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          className={clsx(
            "transition-opacity data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut",
            "fixed top-0 bottom-0 left-0 right-0 grid place-items-center",
            "backdrop-blur-[2px] p-0",
          )}
        >
          <Dialog.Content
            forceMount
            className={clsx(
              "responsive flex flex-col focus:outline-hidden",
              "card animated-modal overflow-clip",
              variant,
              "w-[calc(100vw-4px)] h-[calc(100dvh-4px)]",
              "desktop:max-w-[calc(100vw-4px)] desktop:max-h-[calc(100dvh-4px)]",
              "desktop:min-h-72 desktop:min-w-96",
              "desktop:h-fit desktop:w-fit",
            )}
          >
            <ScrollArea
              orientation="vertical"
              className={clsx(
                "w-[calc(100vw-4px)] h-[calc(100dvh-4px)]",
                "desktop:max-w-[calc(100vw-4px)] desktop:max-h-[calc(100dvh-4px)]",
                "desktop:min-h-72 desktop:min-w-96",
                "desktop:h-fit desktop:w-fit",
              )}
              header={
                <div
                  className={clsx(
                    "flex flex-col gap-1 ",
                    !showHeader && "hidden",
                    "bg-neutral-50/50 dark:bg-neutral-950/50",
                  )}
                >
                  <div
                    className={clsx(headerBottom ? "px-3 pt-3 pb-0" : "p-3", "flex flex-col gap-1")}
                  >
                    <div className="flex flex-row items-center justify-between">
                      <Dialog.Title
                        className={clsx(
                          variant,
                          "text-base/7 font-medium flex align-center",
                          "justify-between responsive variant-static-text",
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
                    <Dialog.Description className="text-sm/6 dark:text-white/50 text-black/50">
                      {description ?? ""}
                    </Dialog.Description>
                  </div>

                  {headerBottom}
                </div>
              }
              footer={
                showFooter && (
                  <div className="p-3 flex gap-3 justify-end">
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
                    {onSubmit && (
                      <Dialog.Close asChild>
                        <Button
                          tabIndex={0}
                          variant={variant}
                          onClick={onSubmit}
                          disabled={submitDisabled}
                        >
                          {submitText}
                        </Button>
                      </Dialog.Close>
                    )}
                  </div>
                )
              }
            >
              <div className="flex-1 md:flex-none dark:text-white text-black p-0">{children}</div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
