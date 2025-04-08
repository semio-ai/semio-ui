import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItemIndicator,
} from "@radix-ui/react-dropdown-menu";
import {
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItemIndicator,
} from "@radix-ui/react-context-menu";
import { type CSSProperties, type ReactNode } from "react";
import { IconCheck, IconPoint } from "@tabler/icons-react";
import { alpha } from "@semio/utils";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { getItemSideStyle, getItemStyle } from "../style-functions";
import { useNestedParent } from "./context";

export interface NestedCheckboxProps {
  variant?: Variant;
  onChange?: (value: boolean) => void;
  value: boolean;
  label: string;
  color?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export function NestedCheckbox({
  variant,
  disabled,
  onChange,
  value,
  color,
  icon,
  label,
}: NestedCheckboxProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenuCheckboxItem : ContextMenuCheckboxItem;

  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown ? DropdownMenuItemIndicator : ContextMenuItemIndicator;

  const GroupComponent = parent === NestedParent.Dropdown ? DropdownMenuGroup : ContextMenuGroup;

  return (
    <GroupComponent
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ItemComponent
        key={label}
        color={color}
        checked={value}
        onCheckedChange={onChange}
        onSelect={(e) => {
          e.preventDefault();
        }}
        disabled={disabled}
        textValue={label}
        style={
          color
            ? ({
                "--text-color-50": alpha(color, 0.5),
                "--text-color-75": alpha(color, 0.75),
                // "--text-color": option.color,
              } as CSSProperties)
            : {}
        }
        className={clsx(
          "text-sm text-inherit/50 leading-none flex items-center",
          "h-8 px-[5px] relative pl-[30px] select-none outline-hidden",
          "data-disabled:pointer-events-none",
          getItemStyle(color ? "custom" : variant),
        )}
      >
        <ItemIndicatorComponent
          forceMount
          className={clsx(
            "absolute left-0 w-[30px] inline-flex items-center justify-center",
            getItemSideStyle(color ? "custom" : variant),
          )}
        >
          {icon || (value ? <IconCheck size="13px" /> : <IconPoint size="13px" />)}
        </ItemIndicatorComponent>
        {label}
      </ItemComponent>
    </GroupComponent>
  );
}
