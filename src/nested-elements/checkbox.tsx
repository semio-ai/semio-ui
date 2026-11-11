import { Menu } from "@base-ui/react/menu";
import { type MouseEvent, type CSSProperties } from "react";
import { alpha, altColor } from "@semio/utils";
import { clsx } from "clsx";
import { useMenuAction } from "../floating/menu-action";
import { Icon, resolveIcon } from "../icons/registry";
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
  // Stays open by default, matching `NestedSelect`: a checkbox in a menu is a
  // toggle among others, and closing after each one would make setting two of
  // them take two trips. `NestedItem` and `NestedRadio` default the other way,
  // because for those the click IS the interaction.
  closeOnSelect = false,
  value,
  color,
  icon,
  label,
}: NestedCheckboxProps) {
  const runAction = useMenuAction();

  return (
    <Menu.Group
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      <Menu.CheckboxItem
        render={(props, state) => (
          <div {...props} data-state={state.checked ? "checked" : "unchecked"} />
        )}
        key={label}
        checked={value}
        onCheckedChange={(next) => runAction(() => onChange?.(next), closeOnSelect)}
        closeOnClick={closeOnSelect}
        disabled={disabled}
        label={label}
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
          "group/item flex items-center rounded-xs leading-none",
          "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",

          "variant-scope highlight-list-item",
          color ? "custom-color" : variant,
        )}
      >
        <Menu.CheckboxItemIndicator
          render={(props, state) => (
            <span {...props} data-state={state.checked ? "checked" : "unchecked"} />
          )}
          className={clsx(
            "absolute top-1/2 left-1 grid -translate-y-1/2 place-items-center",
            "variant-scope check-indicator",
          )}
        >
          <span className="icon-slot">{resolveIcon(icon) ?? <Icon name="selected" />}</span>
        </Menu.CheckboxItemIndicator>
        {label}
      </Menu.CheckboxItem>
    </Menu.Group>
  );
}
