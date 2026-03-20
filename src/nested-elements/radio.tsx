import { DropdownMenu, ContextMenu } from "radix-ui";
import { type CSSProperties, type MouseEvent } from "react";
import { IconPointFilled } from "@tabler/icons-react";
import { clsx } from "clsx";
import { ICON_CLASS_NAME } from "../constants/icon";
import { NestedParent, type NestedRadioProps } from "./types";
import { useNestedParent } from "./context";

/**
 * A component that renders a nested radio button with optional child radio buttons.
 *
 * @param props - The props for the NestedRadio component ({@link NestedRadioProps}).
 * @returns The rendered NestedRadio component.
 */
export function NestedRadio({ variant, disabled, onChange, value, options }: NestedRadioProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.RadioItem : ContextMenu.RadioItem;
  const GroupComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.RadioGroup : ContextMenu.RadioGroup;
  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.ItemIndicator : ContextMenu.ItemIndicator;
  return (
    <GroupComponent
      value={value}
      onValueChange={onChange}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {options.map((option) => (
        <ItemComponent
          key={option.value}
          value={option.value}
          disabled={option.disabled || disabled}
          textValue={option.label}
          style={
            option.color
              ? ({
                  "--custom-color": option.color,
                } as CSSProperties)
              : {}
          }
          onSelect={(e: Event) => {
            if (!option.closeOnSelect) {
              e.preventDefault();
            }
          }}
          className={clsx(
            "leading-none flex items-center rounded-xs group/item",
            "h-7 text-sm px-1.25 relative pl-7.5 select-none outline-hidden",
            "data-disabled:pointer-events-none",
            "responsive highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center",
              "responsive check-indicator",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
          >
            <span className="icon-slot">
              {option.icon ?? <IconPointFilled className={ICON_CLASS_NAME} />}
            </span>
          </ItemIndicatorComponent>
          {option.label}
        </ItemComponent>
      ))}
    </GroupComponent>
  );
}
