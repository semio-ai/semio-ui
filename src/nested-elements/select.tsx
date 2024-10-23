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

export interface NestedSelectProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  values: string[];
  options: {
    label: string;
    value: string;
    disabled?: boolean;
    color?: string;
    icon?: ReactNode;
  }[];
}

export function NestedSelect({ variant, disabled, onChange, values, options }: NestedSelectProps) {
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
      {options.map((option) => (
        <ItemComponent
          key={option.value}
          color={option.color}
          checked={values.find((v) => v === option.value) !== undefined}
          onCheckedChange={(v: boolean) => {
            if (!v && onChange) {
              onChange(values.filter((value) => value !== option.value));
            } else if (onChange) {
              onChange([...values, option.value]);
            }
          }}
          onSelect={(e) => {
            e.preventDefault();
          }}
          disabled={option.disabled || disabled}
          textValue={option.label}
          style={
            option.color
              ? ({
                  "--text-color-50": alpha(option.color, 0.5),
                  "--text-color-75": alpha(option.color, 0.75),
                  // "--text-color": option.color,
                } as CSSProperties)
              : {}
          }
          className={clsx(
            "text-[13px] text-inherit/50 leading-none flex items-center",
            "h-[25px] px-[5px] relative pl-[30px] select-none outline-none",
            "data-[disabled]:pointer-events-none",
            getItemStyle(option.color ? "custom" : variant),
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute left-0 w-[30px] inline-flex items-center justify-center",
              getItemSideStyle(option.color ? "custom" : variant),
            )}
          >
            {option.icon ||
              (values.find((v) => v === option.value) !== undefined ? (
                <IconCheck size="13px" />
              ) : (
                <IconPoint size="13px" />
              ))}
          </ItemIndicatorComponent>
          {option.label}
        </ItemComponent>
      ))}
    </GroupComponent>
  );
}
