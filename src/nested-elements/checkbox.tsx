import { DropdownMenu, ContextMenu } from "radix-ui";
import { type CSSProperties } from "react";
import { IconCheck } from "@tabler/icons-react";
import { alpha, altColor } from "@semio/utils";
import { clsx } from "clsx";
import { useNestedParent } from "./context";
import { NestedParent } from "./types";
import type { NestedCheckboxProps } from "./types";

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
    parent === NestedParent.Dropdown ? DropdownMenu.CheckboxItem : ContextMenu.CheckboxItem;

  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.ItemIndicator : ContextMenu.ItemIndicator;

  const GroupComponent = parent === NestedParent.Dropdown ? DropdownMenu.Group : ContextMenu.Group;

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
                "--custom-color": color,
                "--darker-custom-color": altColor(color, -0.1),
                "--lighter-custom-color": altColor(color, 0.2),
                "--deemphasized-custom-color": alpha(color, 0.5),
              } as CSSProperties)
            : {}
        }
        className={clsx(
          "leading-none flex items-center rounded-xs group/item",
          "h-7 text-sm px-[5px] relative pl-[30px] select-none outline-hidden",
          "data-disabled:pointer-events-none",
          "responsive highlight-list-item",
          color ? "custom-color" : variant,
        )}
      >
        <ItemIndicatorComponent
          className={clsx(
            "absolute left-1 inline-flex items-center justify-center",
            "w-5 h-5 bg-transparent",
          )}
        >
          {icon ?? <IconCheck className="w-3/5 h-3/5" />}
        </ItemIndicatorComponent>
        {label}
      </ItemComponent>
    </GroupComponent>
  );
}
