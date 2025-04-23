import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { NestedParent, Variant } from "../types";
import { NestedParentProvider } from "../nested-elements/context";
import { ScrollArea } from "../scroll-area";
import { Arrow } from "./arrow";

export interface ContextMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  variant?: Variant;
}

function ContextMenu({ trigger, children, variant }: ContextMenuProps) {
  return (
    <div className="relative inline-block text-left">
      <NestedParentProvider value={NestedParent.Context}>
        <ContextMenuPrimitive.Root>
          <ContextMenuPrimitive.Trigger asChild className="select-none">
            {trigger}
          </ContextMenuPrimitive.Trigger>
          <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Content
              alignOffset={3}
              collisionPadding={2}
              className={clsx(
                "card dropdown-content group/menu",
                "min-w-[220px] m-0.5",
                "max-h-(--radix-context-menu-content-available-height)",
                "w-[calc(var(--radix-context-menu-trigger-width)+10px)]",
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
                shrink
                className={clsx("max-h-(--radix-context-menu-content-available-height) p-0.5")}
              >
                {children}
              </ScrollArea>
            </ContextMenuPrimitive.Content>
          </ContextMenuPrimitive.Portal>
        </ContextMenuPrimitive.Root>
      </NestedParentProvider>
    </div>
  );
}

export { ContextMenu };
