import {
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuItemIndicator,
} from "@radix-ui/react-dropdown-menu";
import {
  ContextMenuRadioItem,
  ContextMenuRadioGroup,
  ContextMenuItemIndicator,
} from "@radix-ui/react-context-menu";
import { IconPointFilled } from "@tabler/icons-react";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { getItemSideStyle, getItemStyle } from "../variant-colors";
import { useNestedParent } from "./context";

export interface NestedRadioProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value: string;
  options: { label: string; value: string; disabled?: boolean }[];
}

export function NestedRadio({
  variant,
  disabled,
  onChange,
  value,
  options,
}: NestedRadioProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown
      ? DropdownMenuRadioItem
      : ContextMenuRadioItem;
  const GroupComponent =
    parent === NestedParent.Dropdown
      ? DropdownMenuRadioGroup
      : ContextMenuRadioGroup;

  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown
      ? DropdownMenuItemIndicator
      : ContextMenuItemIndicator;

  return (
    <GroupComponent
      value={value}
      onValueChange={onChange}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {options.map((option) => (
        <ItemComponent
          key={option.value}
          value={option.value}
          disabled={option.disabled || disabled}
          onSelect={(e) => {
            e.preventDefault();
          }}
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
            <IconPointFilled size="13px" />
          </ItemIndicatorComponent>
          {option.label}
        </ItemComponent>
      ))}
    </GroupComponent>
  );
}
