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
            // Closes by default: a radio group holds ONE value, so picking a
            // rung is the whole interaction and there is nothing left to do in
            // the menu. (The multi-value siblings — `NestedSelect` and
            // `NestedCheckbox` — default the other way for the opposite
            // reason.) An option can still opt out explicitly.
            if (option.closeOnSelect === false) {
              e.preventDefault();
            }
          }}
          className={clsx(
            "group/item flex rounded-xs leading-none",
            "relative px-1.25 pl-7.5 text-sm outline-hidden select-none",
            "data-disabled:pointer-events-none",
            "responsive highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
            // A described option is as tall as its two lines; a plain one keeps the
            // fixed 28px it has always had. `min-h-7` rather than `h-7`, so the two
            // shapes can share one menu without the second line overflowing a box
            // sized for one.
            option.description
              ? "min-h-7 flex-col justify-center gap-0.5 py-1"
              : "h-7 items-center",
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute left-1 grid place-items-center",
              // Pinned to the FIRST line, not to the middle of the item. Centring is
              // right while every item is one line and wrong as soon as one is two:
              // the glyph drifts down beside the description and stops reading as a
              // marker on the label it belongs to.
              option.description ? "top-1.5" : "top-1/2 -translate-y-1/2",
              "responsive check-indicator",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
          >
            <span className="icon-slot">
              {resolveIcon(option.icon) ?? <Icon name="radio-selected" />}
            </span>
          </ItemIndicatorComponent>
          {option.label}
          {option.description && (
            // Colour stated outright rather than inherited at reduced opacity: over
            // the item's own `highlight-list-item` colour, opacity tints toward the
            // menu ground and shifts with the variant. A neutral pair holds the same
            // relationship to the label in both themes.
            <span className="text-xs leading-snug font-normal text-neutral-500 dark:text-neutral-400">
              {option.description}
            </span>
          )}
        </ItemComponent>
      ))}
    </GroupComponent>
  );
}
