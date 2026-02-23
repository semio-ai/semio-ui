import { DropdownMenu as DropdownPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { ReactNode, ForwardedRef, forwardRef, CSSProperties, type MouseEventHandler } from "react";
import { Variant } from "../types";
import { NestedParent } from "../nested-elements/types";
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
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTriggerDoubleClick?: MouseEventHandler<HTMLElement>;
  contentClassName?: string;
  scrollOrientation?: "vertical" | "horizontal" | "both";
  matchTriggerWidth?: boolean;
}

const Dropdown = forwardRef(
  (
    {
      header,
      trigger,
      children,
      variant,
      color,
      side,
      disabled,
      onOpenChange,
      onTriggerDoubleClick,
      contentClassName,
      scrollOrientation = "vertical",
      matchTriggerWidth = true,
    }: DropdownProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <NestedParentProvider value={NestedParent.Dropdown}>
        <DropdownPrimitive.Root onOpenChange={onOpenChange}>
          <DropdownPrimitive.Trigger
            ref={ref}
            asChild
            disabled={disabled}
            className="group/trigger"
            onDoubleClick={onTriggerDoubleClick}
          >
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
                "responsive card dropdown-content m-0.5 min-w-55",
                "max-h-[calc(var(--radix-dropdown-menu-content-available-height)-4px)]",
                matchTriggerWidth &&
                  "desktop:w-[calc(var(--radix-dropdown-menu-trigger-width)+10px)]",
                "w-[calc(var(--radix-dropdown-menu-content-available-width)-4px)]",
                contentClassName,
              )}
            >
              <DropdownPrimitive.Arrow asChild width={12} height={6}>
                <Arrow filled={false} variant={variant ?? Variant.Default} color={color} />
              </DropdownPrimitive.Arrow>

              <ScrollArea
                header={header}
                shrinkHeight
                orientation={scrollOrientation}
                wrapperClassName="max-h-[calc(var(--radix-dropdown-menu-content-available-height)-4px)]"
                className={clsx(
                  "max-h-[calc(var(--radix-dropdown-menu-content-available-height)-6px)] p-0.5 gap-0.5 flex-col flex",
                )}
              >
                {children}
              </ScrollArea>
            </DropdownPrimitive.Content>
          </DropdownPrimitive.Portal>
        </DropdownPrimitive.Root>
      </NestedParentProvider>
    );
  },
);

Dropdown.displayName = "Dropdown";

export { Dropdown };
