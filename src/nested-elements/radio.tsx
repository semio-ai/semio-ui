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
import { alpha, altColor } from "@semio/utils";
import { IconPointFilled } from "@tabler/icons-react";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
// import { ScrollArea } from "../scroll-area";
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
    variant?: Variant;
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
      {/* <ScrollArea> */}
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
                  "--darker-custom-color": altColor(option.color, -0.1),
                  "--lighter-custom-color": altColor(option.color, 0.2),
                  "--deemphasized-custom-color": alpha(option.color, 0.5),
                  // "--text-color": option.color,
                } as CSSProperties)
              : {}
          }
          className={clsx(
            "leading-none flex items-center rounded-xs group/item",
            "h-7 text-sm px-[5px] relative pl-[30px] select-none outline-hidden",
            "data-disabled:pointer-events-none",
            "highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute left-1 inline-flex items-center justify-center",
              "check-indicator p-1",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
          >
            {option.icon ?? <IconPointFilled className="w-3/5 h-3/5" />}
          </ItemIndicatorComponent>
          {option.label}
        </ItemComponent>
      ))}
      {/* </ScrollArea> */}
    </GroupComponent>
  );
}
