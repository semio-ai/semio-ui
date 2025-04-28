import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { ReactNode, ForwardedRef, forwardRef, CSSProperties } from "react";
import { NestedParent, Variant } from "../types";
import { NestedParentProvider } from "../nested-elements/context";
import { ScrollArea } from "../layouts/scroll-area";
import { Arrow } from "./arrow";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  variant?: Variant;
  color?: string;
  header?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
}

const Dropdown = forwardRef(
  (
    { header, trigger, children, variant, color, side }: DropdownProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <div className="text-left group flex flex-1">
        <NestedParentProvider value={NestedParent.Dropdown}>
          <DropdownPrimitive.Root>
            <DropdownPrimitive.Trigger ref={ref} asChild className="group/trigger">
              {trigger}
            </DropdownPrimitive.Trigger>
            <DropdownPrimitive.Portal>
              <DropdownPrimitive.Content
                align="center"
                side={side}
                collisionPadding={2}
                sideOffset={3}
                arrowPadding={2}
                style={color ? ({ "--custom-color": color } as CSSProperties) : {}}
                className={clsx(
                  color ? "custom-color" : variant,
                  "responsive card dropdown-content",
                  "min-w-[220px] m-0.5",
                  "max-h-(--radix-dropdown-menu-content-available-height)",
                  "w-[calc(var(--radix-dropdown-menu-trigger-width)+10px)]",
                )}
              >
                <DropdownPrimitive.Arrow asChild width={12} height={6}>
                  <Arrow filled={false} variant={variant ?? Variant.Default} color={color} />
                </DropdownPrimitive.Arrow>

                <ScrollArea
                  header={header}
                  shrink
                  className={clsx("max-h-(--radix-dropdown-menu-content-available-height) p-0.5")}
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
