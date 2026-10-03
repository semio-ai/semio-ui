import { DropdownMenu, ContextMenu } from "radix-ui";
import { type CSSProperties, type MouseEvent } from "react";
import { clsx } from "clsx";
import { Icon, resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
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
        <Tooltip
          key={option.value}
          content={option.description}
          // `disabled` when there is nothing to say, which is Tooltip's own
          // short-circuit: it renders the child bare rather than wrapping it in an
          // armed trigger. So an undescribed option is byte-for-byte the item it has
          // always been, and the description costs nothing where it is unused.
          //
          // Falsy, not `=== undefined`: a `?? ""` call site would otherwise arm a
          // trigger that opens an empty tooltip on hover.
          disabled={!option.description}
          side="right"
        >
          <ItemComponent
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
              "group/item flex items-center rounded-xs leading-none",
              "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
              "data-disabled:pointer-events-none",
              "variant-scope highlight-list-item",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
          >
            <ItemIndicatorComponent
              forceMount
              className={clsx(
                "absolute top-1/2 left-1 grid -translate-y-1/2 place-items-center",
                "variant-scope check-indicator",
                option.color ? "custom-color" : (option.variant ?? variant),
              )}
            >
              <span className="icon-slot">
                {resolveIcon(option.icon) ?? <Icon name="radio-selected" />}
              </span>
            </ItemIndicatorComponent>
            {option.label}
          </ItemComponent>
        </Tooltip>
      ))}
    </GroupComponent>
  );
}
