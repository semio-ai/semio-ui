import { DropdownMenu, ContextMenu } from "radix-ui";
import { type CSSProperties, type MouseEvent } from "react";
import { clsx } from "clsx";
import { Icon, resolveIcon } from "../icons/registry";
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
            "group/item flex items-center rounded-xs leading-none",
            "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
            "data-disabled:pointer-events-none",
            "responsive highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute top-1/2 left-1 grid -translate-y-1/2 place-items-center",
              "responsive check-indicator",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
          >
            <span className="icon-slot">
              {resolveIcon(option.icon) ?? <Icon name="radio-selected" />}
            </span>
          </ItemIndicatorComponent>
          {option.label}
        </ItemComponent>
      ))}
    </GroupComponent>
  );
}
