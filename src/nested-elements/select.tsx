import { DropdownMenu, ContextMenu } from "radix-ui";
import { Fragment, useId, type MouseEvent, type CSSProperties } from "react";
import { clsx } from "clsx";
import { useMenuAction } from "../floating/menu-action";
import { Icon, resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
import { NestedParent, type NestedSelectProps } from "./types";
import { useNestedParent } from "./context";
import { explainDisabled } from "./disabled-reason";

/**
 * A component that renders a select section in a nested menu.
 *
 * @param props - The props for the Select component ({@link NestedSelectProps}).
 * @returns The rendered NestedSelect section component.
 */
export function NestedSelect({ variant, disabled, onChange, values, options }: NestedSelectProps) {
  const runAction = useMenuAction();
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.CheckboxItem : ContextMenu.CheckboxItem;

  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.ItemIndicator : ContextMenu.ItemIndicator;

  const GroupComponent = parent === NestedParent.Dropdown ? DropdownMenu.Group : ContextMenu.Group;
  const reasonIdPrefix = useId();

  return (
    <GroupComponent
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {options.map((option, index) => {
        // Only the option's own reason makes it reachable while disabled; see
        // `NestedRadio`.
        const reason = explainDisabled(
          option.disabled || disabled,
          option.disabledReason,
          `${reasonIdPrefix}-${index}`,
        );
        const tooltip = reason.explained ? option.disabledReason : option.description;
        return (
          <Fragment key={option.value}>
            {reason.reasonElement}
            <Tooltip
              content={tooltip}
              // Same short-circuit as `NestedRadio`: no description means Tooltip renders
              // the child bare, so an undescribed option is unchanged.
              disabled={!tooltip}
              side="right"
            >
              <ItemComponent
                color={option.color}
                checked={values.find((v) => v === option.value) !== undefined}
                onCheckedChange={(v: boolean) => {
                  runAction(() => {
                    if (!v) onChange?.(values.filter((value) => value !== option.value));
                    else onChange?.([...values, option.value]);
                  }, option.closeOnSelect === true);
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
                disabled={reason.primitiveDisabled}
                {...reason.itemProps}
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
                  // Kept for an option disabled with a reason, whose tooltip needs the
                  // pointer; its click is prevented, so no toggle goes through.
                  !reason.explained && "data-disabled:pointer-events-none",
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
                    {resolveIcon(option.icon) ||
                      (values.find((v) => v === option.value) !== undefined ? (
                        <Icon name="selected" />
                      ) : (
                        <Icon name="unselected" />
                      ))}
                  </span>
                </ItemIndicatorComponent>
                {option.label}
              </ItemComponent>
            </Tooltip>
          </Fragment>
        );
      })}
    </GroupComponent>
  );
}
