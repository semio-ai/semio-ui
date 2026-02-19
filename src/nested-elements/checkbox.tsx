import { DropdownMenu, ContextMenu } from "radix-ui";
import { type CSSProperties } from "react";
import { IconCheck } from "@tabler/icons-react";
import { alpha, altColor } from "@semio/utils";
import { clsx } from "clsx";
import { ICON_CLASS_NAME } from "../constants/icon";
import { useNestedParent } from "./context";
import { NestedParent } from "./types";
import type { NestedCheckboxProps } from "./types";

/**
 * A component that renders a nested checkbox with optional child checkboxes.
 *
 * @param props - The props for the NestedCheckbox component ({@link NestedCheckboxProps}).
 * @returns The rendered NestedCheckbox component.
 */
export function NestedCheckbox({
  variant,
  disabled,
  onChange,
  closeOnSelect,
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
          if (!closeOnSelect) {
            e.preventDefault();
          }
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
            "absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center",
            "responsive check-indicator",
          )}
        >
          <span className="icon-slot">{icon ?? <IconCheck className={ICON_CLASS_NAME} />}</span>
        </ItemIndicatorComponent>
        {label}
      </ItemComponent>
    </GroupComponent>
  );
}
