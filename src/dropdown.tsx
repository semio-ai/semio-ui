import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { NestedParent, Variant } from "./types";
import { getBorder, getBasicTextColor } from "./style-functions";
import { NestedParentProvider } from "./nested-elements/context";
import { ScrollArea } from "./scroll-area";
import "./styles.css";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  variant?: Variant;
  header?: ReactNode;
}

function Dropdown({ header, trigger, children, variant }: DropdownProps) {
  return (
    <div className="text-left group">
      <NestedParentProvider value={NestedParent.Dropdown}>
        <DropdownPrimitive.Root>
          <DropdownPrimitive.Trigger asChild>
            {trigger}
          </DropdownPrimitive.Trigger>
          <DropdownPrimitive.Portal>
            <DropdownPrimitive.Content
              align="center"
              sideOffset={3}
              className={clsx(
                "will-change-[opacity,transform]",
                "data-[side=top]:animate-slideDownAndFade",
                "data-[side=right]:animate-slideLeftAndFade",
                "data-[side=bottom]:animate-slideUpAndFade",
                "data-[side=left]:animate-slideRightAndFade",
                "min-w-[220px] shadow-md",
                "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg",
                "data-[side=bottom]:border-t-2 border-solid",
                "data-[side=top]:border-b-2 border-solid",
                "data-[side=right]:border-l-2 border-solid",
                "data-[side=left]:border-r-2 border-solid",
                "max-h-[--radix-dropdown-menu-content-available-height]",
                "w-[calc(var(--radix-dropdown-menu-trigger-width)+10px)]",
                getBorder(variant),
              )}
            >
              <DropdownPrimitive.Arrow
                className={clsx(
                  "relative fill-current",
                  getBasicTextColor(variant),
                )}
              />
              <ScrollArea
                header={header}
                shrink
                className={
                  clsx("max-h-[--radix-dropdown-menu-content-available-height]")
                  // "max-h-[calc(var(--radix-dropdown-menu-content-available-height)-0px)]",
                }
              >
                {children}
              </ScrollArea>
            </DropdownPrimitive.Content>
          </DropdownPrimitive.Portal>
        </DropdownPrimitive.Root>
      </NestedParentProvider>
    </div>
  );
}

export { Dropdown };
