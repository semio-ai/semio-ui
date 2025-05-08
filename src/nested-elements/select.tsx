import { DropdownMenu, ContextMenu } from "radix-ui";
import { type CSSProperties } from "react";
import { IconCheck, IconPoint } from "@tabler/icons-react";
import { clsx } from "clsx";
import { NestedParent, type NestedSelectProps } from "./types";
import { useNestedParent } from "./context";

/**
 * A component that renders a select section in a nested menu.
 *
 * @param props - The props for the Select component ({@link NestedSelectProps}).
 * @returns The rendered NestedSelect section component.
 */
export function NestedSelect({ variant, disabled, onChange, values, options }: NestedSelectProps) {
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
                  "--custom-color": option.color,
                  // "--text-color": option.color,
                } as CSSProperties)
              : {}
          }
          className={clsx(
            "leading-none flex items-center rounded-xs group/item",
            "h-7 text-sm px-[5px] relative pl-[30px] select-none outline-hidden",
            "data-disabled:pointer-events-none",
            "responsive highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute left-1 inline-flex items-center justify-center",
              "responsive check-indicator",
              option.color ? "custom-color" : (option.variant ?? variant),
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
