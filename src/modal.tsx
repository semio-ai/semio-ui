import { type ReactNode, type MouseEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
import { ScrollArea } from "./scroll-area";
import { Variant } from "./types";
import { getBorder } from "./style-functions";
import { IconButton } from "./buttons/icon-button";
import { TextButton } from "./buttons/text-button";

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
  submitText = "Submit",
  onStateChange,
  onSubmit,
  onCancel,
  variant,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onStateChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          className={clsx(
            "transition-opacity data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut",
            "fixed top-0 bottom-0 left-0 right-0 grid place-items-center",
            "bg-black/30 backdrop-blur-[2px] p-0",
          )}
        >
          {/* </Transition> */}

          <Dialog.Content
            forceMount
            className={clsx(
              "flex flex-col focus:outline-none",
              "w-screen h-screen md:w-3/5 md:max-h-[85vh]",
              "data-[state=open]:animate-modalAppear data-[state=closed]:animate-modalDisappear",
              "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg",
              "border-t-2 border-solid",
              "max-h-screen h-screen md:max-h-[85vh] md:h-fit",
              getBorder(variant),
            )}
          >
            <ScrollArea
              // shrink
              className="md:max-h-[85vh] max-h-screen"
              // className="w-screen h-screen md:w-3/5 md:h-fit bg-cyan-500"
              header={
                <div className="flex flex-col pt-6 px-6 pb-2 gap-1">
                  <Dialog.Title className="text-base/7 font-medium dark:text-white text-black flex align-center justify-between">
                    {title}
                    <Dialog.Close asChild>
                      <IconButton variant={Variant.Default}>
                        <IconX />
                      </IconButton>
                    </Dialog.Close>
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className="text-sm/6 dark:text-white/50 text-black/50">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
              }
              footer={
                <div className="p-2 flex gap-3 justify-end">
                  {onCancel && (
                    <Dialog.Close asChild>
                      <TextButton
                        variant={Variant.Default}
                        onClick={onCancel}
                        disabled={submitDisabled}
                      >
                        Cancel
                      </TextButton>
                    </Dialog.Close>
                  )}
                  {onSubmit && (
                    <Dialog.Close asChild>
                      <TextButton
                        variant={variant}
                        onClick={onSubmit}
                        disabled={submitDisabled}
                      >
                        {submitText}
                      </TextButton>
                    </Dialog.Close>
                  )}
                </div>
              }
            >
              <div className="flex-1 md:flex-none p-2 dark:text-white text-black">
                {children}
              </div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
