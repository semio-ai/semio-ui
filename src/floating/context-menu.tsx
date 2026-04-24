import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant } from "../types";
import { NestedParent } from "../nested-elements/types";
import { NestedParentProvider } from "../nested-elements/context";
import { ScrollArea } from "../layouts/scroll-area";

export interface ContextMenuProps {
  content: ReactNode;
  children: ReactNode;
  variant?: Variant;
  color?: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ContextMenu({ content, children, variant, color, disabled, onOpenChange }: ContextMenuProps) {
  if (disabled) {
    return (
      <NestedParentProvider value={NestedParent.Context}>
        <span className="pointer-events-none" aria-disabled="true">
          {children}
        </span>
      </NestedParentProvider>
    );
  }
  return (
    <NestedParentProvider value={NestedParent.Context}>
      <ContextMenuPrimitive.Root onOpenChange={onOpenChange}>
        <ContextMenuPrimitive.Trigger asChild>{children}</ContextMenuPrimitive.Trigger>
        <ContextMenuPrimitive.Portal>
          <ContextMenuPrimitive.Content
            alignOffset={3}
            collisionPadding={2}
            className={clsx(
              color ? "custom-color" : variant,
              "responsive card dropdown-content m-0.5 min-w-55",
              "max-h-[calc(var(--radix-context-menu-content-available-height)-4px)]",
              "desktop:w-[calc(var(--radix-context-menu-trigger-width)+10px)]",
              "w-[calc(var(--radix-context-menu-content-available-width)-4px)]",
            )}
          >
            {/* For now, disabling the arrow because we can't position it in the same way we can with dropdowns */}
            {/* <ContextMenuPrimitive.Arrow asChild width={12} height={6}>
                <Arrow
                  filled={false}
                  variant={variant ?? Variant.Default}
                />
              </ContextMenuPrimitive.Arrow> */}

            <ScrollArea
              shrinkHeight
              className={clsx(
                "max-h-[calc(var(--radix-context-menu-content-available-height)-4px)] p-0.5",
              )}
            >
              {content}
            </ScrollArea>
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      </ContextMenuPrimitive.Root>
    </NestedParentProvider>
  );
}

export { ContextMenu };
