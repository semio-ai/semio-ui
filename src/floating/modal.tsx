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
}

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
