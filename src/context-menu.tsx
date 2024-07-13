import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { NestedParent, Variant } from "./types";
import { getBasicTextColor, getBorder } from "./style-functions";
import { NestedParentProvider } from "./nested-elements/context";

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
              className={clsx(
                "will-change-[opacity,transform]",
                "data-[side=top]:animate-slideDownAndFade",
                "data-[side=right]:animate-slideLeftAndFade",
                "data-[side=bottom]:animate-slideUpAndFade",
                "data-[side=left]:animate-slideRightAndFade",
                "min-w-[220px] p-[5px] shadow-md",
                "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg",
                "border-t-2 border-solid",
                getBorder(variant),
              )}
            >
              <ContextMenuPrimitive.Arrow
                className={clsx("fill-current", getBasicTextColor(variant))}
              />
              {children}
            </ContextMenuPrimitive.Content>
          </ContextMenuPrimitive.Portal>
        </ContextMenuPrimitive.Root>
      </NestedParentProvider>
    </div>
  );
}

export { ContextMenu };
