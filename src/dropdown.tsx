import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { ReactNode, ForwardedRef, forwardRef } from "react";
import { NestedParent, Variant } from "./types";
import { getBorder, getBasicTextColor } from "./style-functions";
import { NestedParentProvider } from "./nested-elements/context";
import { ScrollArea } from "./scroll-area";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  variant?: Variant;
  header?: ReactNode;
}

const Dropdown = forwardRef(
  ({ header, trigger, children, variant }: DropdownProps, ref: ForwardedRef<HTMLButtonElement>) => {
    return (
      <div className="text-left group flex flex-1">
        <NestedParentProvider value={NestedParent.Dropdown}>
          <DropdownPrimitive.Root>
            <DropdownPrimitive.Trigger ref={ref} asChild className="focus:outline-none">
              {trigger}
            </DropdownPrimitive.Trigger>
            <DropdownPrimitive.Portal>
              <DropdownPrimitive.Content
                align="center"
                sideOffset={3}
                className={clsx(
                  variant,
                  "card",
                  "will-change-[opacity,transform]",
                  "data-[side=top]:animate-slideDownAndFade",
                  "data-[side=right]:animate-slideLeftAndFade",
                  "data-[side=bottom]:animate-slideUpAndFade",
                  "data-[side=left]:animate-slideRightAndFade",
                  "min-w-[220px]",
                  "max-h-(--radix-dropdown-menu-content-available-height)",
                  "w-[calc(var(--radix-dropdown-menu-trigger-width)+10px)]",
                  getBorder(variant),
                )}
              >
                <DropdownPrimitive.Arrow
                  className={clsx("relative fill-current", getBasicTextColor(variant))}
                />
                <ScrollArea
                  header={header}
                  shrink
                  className={clsx("max-h-(--radix-dropdown-menu-content-available-height)")}
                >
                  {children}
                </ScrollArea>
              </DropdownPrimitive.Content>
            </DropdownPrimitive.Portal>
          </DropdownPrimitive.Root>
        </NestedParentProvider>
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

export { Dropdown };
