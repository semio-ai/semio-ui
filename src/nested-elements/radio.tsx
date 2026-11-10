import { Menu } from "@base-ui/react/menu";
import { Fragment, useId, type CSSProperties, type MouseEvent } from "react";
import { clsx } from "clsx";
import { useMenuAction } from "../floating/menu-action";
import { Icon, resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
import { type NestedRadioProps } from "./types";
import { explainDisabled } from "./disabled-reason";

/**
 * A component that renders a nested radio button with optional child radio buttons.
 *
 * @param props - The props for the NestedRadio component ({@link NestedRadioProps}).
 * @returns The rendered NestedRadio component.
 */
export function NestedRadio({ variant, disabled, onChange, value, options }: NestedRadioProps) {
  const runAction = useMenuAction();
  const reasonIdPrefix = useId();
  // A reason explains disability; descriptions explain what choosing the option means.
  const reasons = options.map((option, index) =>
    explainDisabled(
      option.disabled || disabled,
      option.disabledReason,
      `${reasonIdPrefix}-${index}`,
    ),
  );
  return (
    <Menu.RadioGroup
      value={value}
      onValueChange={(next) =>
        runAction(
          () => onChange?.(next),
          options.find((option) => option.value === next)?.closeOnSelect !== false,
        )
      }
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {options.map((option, index) => (
        <Fragment key={option.value}>
          {reasons[index].reasonElement}
          <Tooltip
            content={reasons[index].explained ? option.disabledReason : option.description}
            // `disabled` when there is nothing to say, which is Tooltip's own
            // short-circuit: it renders the child bare rather than wrapping it in an
            // armed trigger. So an undescribed option is byte-for-byte the item it has
            // always been, and the description costs nothing where it is unused.
            //
            // Falsy, not `=== undefined`: a `?? ""` call site would otherwise arm a
            // trigger that opens an empty tooltip on hover.
            disabled={!(reasons[index].explained ? option.disabledReason : option.description)}
            side="right"
          >
            <Menu.RadioItem
              render={(props, state) => (
                <div {...props} data-state={state.checked ? "checked" : "unchecked"} />
              )}
              value={option.value}
              disabled={reasons[index].primitiveDisabled}
              {...reasons[index].itemProps}
              label={option.label}
              style={
                option.color
                  ? ({
                      "--custom-color": option.color,
                    } as CSSProperties)
                  : {}
              }
              closeOnClick={option.closeOnSelect !== false}
              className={clsx(
                "group/item flex items-center rounded-xs leading-none",
                "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
                "variant-scope highlight-list-item",
                option.color ? "custom-color" : (option.variant ?? variant),
              )}
            >
              <Menu.RadioItemIndicator
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
                  {resolveIcon(option.icon) ?? <Icon name="radio-selected" />}
                </span>
              </Menu.RadioItemIndicator>
              {option.label}
            </Menu.RadioItem>
          </Tooltip>
        </Fragment>
      ))}
    </Menu.RadioGroup>
  );
}
