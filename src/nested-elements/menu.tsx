import { ReactNode } from "react";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@radix-ui/react-dropdown-menu";
import {
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuPortal,
  ContextMenuSubContent,
} from "@radix-ui/react-context-menu";
import { IconChevronRight } from "@tabler/icons-react";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { ScrollArea } from "../scroll-area";
import { useNestedParent } from "./context";

export interface NestedMenuProps {
  left?: ReactNode;
  children: ReactNode;
  label?: string;
  variant?: Variant;
  disabled?: boolean;
}

export function NestedMenu({ left, children, label, variant, disabled }: NestedMenuProps) {
  const parent = useNestedParent();

  const SubComponent = parent === NestedParent.Dropdown ? DropdownMenuSub : ContextMenuSub;
  const SubTriggerComponent =
    parent === NestedParent.Dropdown ? DropdownMenuSubTrigger : ContextMenuSubTrigger;
  const PortalComponent = parent === NestedParent.Dropdown ? DropdownMenuPortal : ContextMenuPortal;
  const SubContentComponent =
    parent === NestedParent.Dropdown ? DropdownMenuSubContent : ContextMenuSubContent;

  return (
    <SubComponent>
      <SubTriggerComponent
        disabled={disabled}
        className={clsx(
          "leading-none flex items-center rounded-xs group/item",
          "h-7 text-sm px-[5px] relative pl-[30px] select-none outline-hidden",
          "data-disabled:pointer-events-none",
          "highlight-list-item",
          variant,
        )}
      >
        {left && (
          <div
            className={clsx(
              "absolute left-0 w-[30px] inline-flex items-center justify-center",
              "check-indicator",
              variant,
            )}
          >
            {left}
          </div>
        )}
        {label}

        <div className={clsx("absolute right-1", "check-indicator", variant)}>
          <IconChevronRight size="h-3/5 w-3/5" />
        </div>
      </SubTriggerComponent>
      <PortalComponent>
        <SubContentComponent>
          <div
            className={clsx(
              variant,
              "card dropdown-content",
              "min-w-[220px]",
              parent === NestedParent.Dropdown
                ? "max-h-(--radix-dropdown-menu-content-available-height)"
                : "max-h-(--radix-context-menu-content-available-height)",
              parent === NestedParent.Dropdown
                ? "w-[calc(var(--radix-dropdown-menu-trigger-width)+10px)]"
                : "w-[calc(var(--radix-context-menu-trigger-width)+10px)]",
            )}
          >
            <ScrollArea
              shrink
              className={clsx(
                "p-0.5",
                parent === NestedParent.Dropdown
                  ? "max-h-(--radix-dropdown-menu-content-available-height)"
                  : "max-h-(--radix-context-menu-content-available-height)",
              )}
            >
              {children}
            </ScrollArea>
          </div>
        </SubContentComponent>
      </PortalComponent>
    </SubComponent>
  );
}
