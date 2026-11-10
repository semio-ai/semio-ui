import { Menu } from "@base-ui/react/menu";
import { Fragment, useId, type MouseEvent, type CSSProperties } from "react";
import { clsx } from "clsx";
import { useMenuAction } from "../floating/menu-action";
import { Icon, resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
import { type NestedSelectProps } from "./types";
import { explainDisabled } from "./disabled-reason";

/**
 * A component that renders a select section in a nested menu.
 *
 * @param props - The props for the Select component ({@link NestedSelectProps}).
 * @returns The rendered NestedSelect section component.
 */
export function NestedSelect({ variant, disabled, onChange, values, options }: NestedSelectProps) {
  const runAction = useMenuAction();

  const reasonIdPrefix = useId();

  return (
    <Menu.Group
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {options.map((option, index) => {
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
              <Menu.CheckboxItem
                render={(props, state) => (
                  <div {...props} data-state={state.checked ? "checked" : "unchecked"} />
                )}
                checked={values.find((v) => v === option.value) !== undefined}
                onCheckedChange={(v: boolean) => {
                  runAction(() => {
                    if (!v) onChange?.(values.filter((value) => value !== option.value));
                    else onChange?.([...values, option.value]);
                  }, option.closeOnSelect === true);
                }}
                closeOnClick={option.closeOnSelect === true}
                disabled={reason.primitiveDisabled}
                {...reason.itemProps}
                label={option.label}
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
                  "variant-scope highlight-list-item",
                  option.color ? "custom-color" : (option.variant ?? variant),
                )}
              >
                <Menu.CheckboxItemIndicator
                  render={(props, state) => (
                    <span {...props} data-state={state.checked ? "checked" : "unchecked"} />
                  )}
                  keepMounted
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
                </Menu.CheckboxItemIndicator>
                {option.label}
              </Menu.CheckboxItem>
            </Tooltip>
          </Fragment>
        );
      })}
    </Menu.Group>
  );
}
