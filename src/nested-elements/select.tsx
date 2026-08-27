import { DropdownMenu, ContextMenu } from "radix-ui";
import type { MouseEvent, CSSProperties } from "react";
import { clsx } from "clsx";
import { Icon, resolveIcon } from "../icons/registry";
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
            "group/item flex rounded-xs leading-none",
            "relative px-1.25 pl-7.5 text-sm outline-hidden select-none",
            "data-disabled:pointer-events-none",
            "responsive highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
            // Matches `NestedRadio` exactly: one option shape serves both controls, so
            // a description has to lay out the same way in each. See the note there.
            option.description
              ? "min-h-7 flex-col justify-center gap-0.5 py-1"
              : "h-7 items-center",
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute left-1 grid place-items-center",
              option.description ? "top-1.5" : "top-1/2 -translate-y-1/2",
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
          {option.description && (
            <span className="text-xs leading-snug font-normal text-neutral-500 dark:text-neutral-400">
              {option.description}
            </span>
          )}
        </ItemComponent>
      ))}
    </GroupComponent>
  );
}
