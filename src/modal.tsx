import { type ReactNode, type MouseEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
import { ScrollArea } from "./scroll-area";
import { Variant } from "./types";
import { getBasicTextColor, getBorder } from "./style-functions";
import { Button } from "./buttons/button";

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
  scrollDisabled,
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
              "flex flex-col focus:outline-hidden",
              "data-[state=open]:animate-modalAppear data-[state=closed]:animate-modalDisappear",
              "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg shadow-md",
              "border-t-2 border-solid",
              "w-screen md:w-3/5 md:max-w-[750px]",
              "max-h-screen h-[100dvh] md:max-h-[85vh] md:h-fit",
              getBorder(variant),
            )}
          >
            {!scrollDisabled && (
              <ScrollArea
                className="md:max-h-[85dvh] max-h-[100dvh]"
                header={
                  <div
                    className={clsx(
                      "bg-neutral-50/50 dark:bg-neutral-950/50",
                      "flex flex-col gap-1",
                      !showHeader && "hidden",
                    )}
                  >
                    <div
                      className={clsx(
                        headerBottom ? "px-3 pt-3 pb-0" : "p-3",
                        "flex flex-col gap-1",
                        getBasicTextColor(variant),
                      )}
                    >
                      <div className="flex flex-row items-center justify-between">
                        <Dialog.Title className="text-base/7 font-medium flex align-center justify-between">
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
                    <div className="p-2 flex gap-3 justify-end">
                      {onCancel && (
                        <Dialog.Close asChild>
                          <Button
                            variant={Variant.Default}
                            onClick={onCancel}
                            disabled={submitDisabled}
                          >
                            Cancel
                          </Button>
                        </Dialog.Close>
                      )}
                      {onSubmit && (
                        <Dialog.Close asChild>
                          <Button variant={variant} onClick={onSubmit} disabled={submitDisabled}>
                            {submitText}
                          </Button>
                        </Dialog.Close>
                      )}
                    </div>
                  )
                }
              >
                <div className="flex-1 md:flex-none dark:text-white text-black bg-neutral-50/50 dark:bg-neutral-950/50">
                  {children}
                </div>
              </ScrollArea>
            )}
            {scrollDisabled && (
              <div className="backdrop-blur-md md:max-h-[85dvh] max-h-[100dvh] bg-neutral-50/50 dark:bg-neutral-950/50 flex flex-col">
                <div
                  className={clsx(
                    "bg-neutral-50/50 dark:bg-neutral-950/50",
                    "flex flex-col gap-1",
                    !showHeader && "hidden",
                  )}
                >
                  <div
                    className={clsx(
                      headerBottom ? "px-3 pt-3 pb-0" : "p-3",
                      "flex flex-col gap-1",
                      getBasicTextColor(variant),
                    )}
                  >
                    <div className="flex flex-row items-center justify-between">
                      <Dialog.Title className="text-base/7 font-medium flex align-center justify-between">
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
                <div className="flex-1 md:flex-none dark:text-white text-black min-h-0">
                  {children}
                </div>
                {showFooter && (
                  <div className="p-2 flex gap-3 justify-end">
                    {onCancel && (
                      <Dialog.Close asChild>
                        <Button
                          variant={Variant.Default}
                          onClick={onCancel}
                          disabled={submitDisabled}
                        >
                          Cancel
                        </Button>
                      </Dialog.Close>
                    )}
                    {onSubmit && (
                      <Dialog.Close asChild>
                        <Button variant={variant} onClick={onSubmit} disabled={submitDisabled}>
                          {submitText}
                        </Button>
                      </Dialog.Close>
                    )}
                  </div>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
