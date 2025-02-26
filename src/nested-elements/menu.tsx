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
import { getItemSideStyle, getItemStyle, getBorder } from "../style-functions";
import { useNestedParent } from "./context";

export interface NestedMenuProps {
  left?: ReactNode;
  children: ReactNode;
  label?: string;
  variant?: Variant;
  labelVariant?: Variant;
  disabled?: boolean;
}

export function NestedMenu({
  left,
  children,
  label,
  variant,
  labelVariant,
  disabled,
}: NestedMenuProps) {
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
          "text-sm leading-none flex items-center",
          "h-8 px-[5px] relative pl-[30px] select-none outline-none",
          "data-[disabled]:pointer-events-none",
          getItemStyle(labelVariant),
        )}
      >
        {left && (
          <div
            className={clsx(
              "absolute left-0 w-[30px] inline-flex items-center justify-center",
              getItemSideStyle(labelVariant),
            )}
          >
            {left}
          </div>
        )}
        {label}

        <div className={clsx("ml-auto pl-[20px]", getItemSideStyle(labelVariant))}>
          <IconChevronRight size="13px" />
        </div>
      </SubTriggerComponent>
      <PortalComponent>
        <SubContentComponent>
          <div
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
            {children}
          </div>
        </SubContentComponent>
      </PortalComponent>
    </SubComponent>
  );
}
