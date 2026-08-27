import { DropdownMenu, ContextMenu } from "radix-ui";
import type { MouseEvent, CSSProperties } from "react";
import { clsx } from "clsx";
import { Icon, resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
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
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {options.map((option) => (
        <Tooltip
          key={option.value}
          content={option.description}
          // Same short-circuit as `NestedRadio`: no description means Tooltip renders
          // the child bare, so an undescribed option is unchanged.
          disabled={option.description === undefined}
          side="right"
        >
          <ItemComponent
            color={option.color}
            checked={values.find((v) => v === option.value) !== undefined}
            onCheckedChange={(v: boolean) => {
              if (!v && onChange) {
                onChange(values.filter((value) => value !== option.value));
              } else if (onChange) {
                onChange([...values, option.value]);
              }
            }}
            onSelect={(e: Event) => {
              // Stays open by default, unlike `NestedItem` and `NestedRadio`:
              // this is the MULTI-value control, so toggling one option is
              // rarely the end of the interaction and closing after each would
              // make selecting two things take two trips. Opt in per option
              // where a group really does hold a single toggle.
              if (option.closeOnSelect !== true) {
                e.preventDefault();
              }
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
                {resolveIcon(option.icon) ||
                  (values.find((v) => v === option.value) !== undefined ? (
                    <Icon name="check" />
                  ) : (
                    <Icon name="point" />
                  ))}
              </span>
            </ItemIndicatorComponent>
            {option.label}
          </ItemComponent>
        </Tooltip>
      ))}
    </GroupComponent>
  );
}
