import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { NestedParent, Variant } from "./types";
import { getBasicTextColor, getBorder } from "./variant-colors";
import { NestedParentProvider } from "./nested-elements/context";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  variant?: Variant;
}

function Dropdown({ trigger, children, variant }: DropdownProps) {
  return (
    <div className="relative inline-block text-left">
      <NestedParentProvider value={NestedParent.Dropdown}>
        <DropdownPrimitive.Root>
          <DropdownPrimitive.Trigger asChild className="select-none">
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
                "min-w-[220px] p-[5px] shadow-md",
                "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg",
                "border-t-2 border-solid",
                getBorder(variant),
              )}
            >
              <DropdownPrimitive.Arrow
                className={clsx("fill-current", getBasicTextColor(variant))}
              />
              {children}
            </DropdownPrimitive.Content>
          </DropdownPrimitive.Portal>
        </DropdownPrimitive.Root>
      </NestedParentProvider>
    </div>
  );
}

export { Dropdown };
