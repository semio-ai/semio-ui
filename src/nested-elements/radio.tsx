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
import { CSSProperties, type ReactNode } from "react";
import { altColor } from "@semio/utils";
import { IconPointFilled } from "@tabler/icons-react";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { ScrollArea } from "../scroll-area";
import { useNestedParent } from "./context";

export interface NestedRadioProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
    color?: string;
    icon?: ReactNode;
  }[];
}

export function NestedRadio({ variant, disabled, onChange, value, options }: NestedRadioProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenuRadioItem : ContextMenuRadioItem;
  const GroupComponent =
    parent === NestedParent.Dropdown ? DropdownMenuRadioGroup : ContextMenuRadioGroup;
  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown ? DropdownMenuItemIndicator : ContextMenuItemIndicator;
  return (
    <GroupComponent
      value={value}
      onValueChange={onChange}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ScrollArea>
        {options.map((option) => (
          <ItemComponent
            key={option.value}
            value={option.value}
            disabled={option.disabled || disabled}
            onSelect={(e) => {
              e.preventDefault();
            }}
            textValue={option.label}
            style={
              option.color
                ? ({
                    "--custom-color": option.color,
                    "--lighter-custom-color": altColor(option.color, 0.5),
                    "--darker-custom-color": altColor(option.color, -0.5),
                    // "--text-color": option.color,
                  } as CSSProperties)
                : {}
            }
            className={clsx(
              "leading-none flex items-center",
              "h-8 text-sm px-[5px] relative pl-[30px] select-none outline-hidden",
              "data-disabled:pointer-events-none",
              "highlight-list-item",
              option.color ? "custom-color" : variant,
            )}
          >
            <ItemIndicatorComponent
              forceMount
              className={clsx(
                "absolute left-0 w-[30px] inline-flex items-center justify-center",
                "check-indicator",
              )}
            >
              {option.icon || <IconPointFilled size="13px" />}
            </ItemIndicatorComponent>
            {option.label}
          </ItemComponent>
        ))}
      </ScrollArea>
    </GroupComponent>
  );
}
