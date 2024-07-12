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
import { IconCheck } from "@tabler/icons-react";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { getItemSideStyle, getItemStyle } from "../variant-colors";
import { useNestedParent } from "./context";

export interface NestedSelectProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  values: string[];
  options: { label: string; value: string; disabled?: boolean }[];
}

export function NestedSelect({
  variant,
  disabled,
  onChange,
  values,
  options,
}: NestedSelectProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown
      ? DropdownMenuCheckboxItem
      : ContextMenuCheckboxItem;

  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown
      ? DropdownMenuItemIndicator
      : ContextMenuItemIndicator;

  const GroupComponent =
    parent === NestedParent.Dropdown ? DropdownMenuGroup : ContextMenuGroup;

  return (
    <GroupComponent
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {options.map((option) => (
        <ItemComponent
          key={option.value}
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
          className={clsx(
            "text-[13px] leading-none flex items-center",
            "h-[25px] px-[5px] relative pl-[30px] select-none outline-none",
            "data-[disabled]:pointer-events-none",
            getItemStyle(variant),
          )}
        >
          <ItemIndicatorComponent
            className={clsx(
              "absolute left-0 w-[30px] inline-flex items-center justify-center",
              getItemSideStyle(variant),
            )}
          >
            <IconCheck size="13px" />
          </ItemIndicatorComponent>
          {option.label}
        </ItemComponent>
      ))}
    </GroupComponent>
  );
}
