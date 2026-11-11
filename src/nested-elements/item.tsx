import { useId, type MouseEvent } from "react";
import { Menu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { useMenuAction } from "../floating/menu-action";
import { resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
import { type NestedItemProps } from "./types";
import { explainDisabled } from "./disabled-reason";

export function NestedItem({
  left,
  children,
  right,
  variant,
  disabled,
  onClick,
  closeOnSelect = true,
  testId,
  description,
  descriptionVariant,
}: NestedItemProps) {
  const runAction = useMenuAction();
  const reason = explainDisabled(disabled, description, useId());

  return (
    <>
      {reason.reasonElement}
      <Tooltip
        content={description}
        disabled={!description}
        side="right"
        variant={descriptionVariant}
      >
        <Menu.Item
          disabled={reason.primitiveDisabled}
          closeOnClick={closeOnSelect}
          onClick={
            disabled || !onClick
              ? undefined
              : (event) => {
                  // An entry that stays open runs in the event, with the live event, so
                  // its handler can stop propagation to ancestors.
                  if (!closeOnSelect) {
                    onClick(event);
                    return;
                  }
                  event.stopPropagation();
                  // A closing entry's action runs after the menu has closed, when React
                  // has cleared `currentTarget`; this copy keeps the selected element.
                  const actionEvent = Object.create(event) as MouseEvent;
                  actionEvent.currentTarget = event.currentTarget;
                  runAction(() => onClick(actionEvent), true);
                }
          }
          {...reason.itemProps}
          data-testid={testId}
          className={clsx(
            "group/item flex items-center rounded-xs leading-none",
            "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
            "variant-scope highlight-list-item",
            variant,
          )}
        >
          {left && (
            <div
              className={clsx(
                "absolute top-1/2 left-1 inline-flex -translate-y-1/2 items-center justify-center",
                "variant-scope list-item-extra highlight-list-item",
                variant,
              )}
            >
              {/* Normalizes any icon set to one size + centers it (see `.list-item-icon`),
                so glyphs don't shift with their own intrinsic width in this w-fit slot.
                resolveIcon lets `left` be a registry key or a node. */}
              <span className="list-item-icon">{resolveIcon(left)}</span>
            </div>
          )}
          {children}
          {right && (
            <div
              className={clsx(
                "absolute top-1/2 right-1 inline-flex -translate-y-1/2 items-center justify-center",
                "variant-scope list-item-extra",
                variant,
              )}
            >
              {right}
            </div>
          )}
        </Menu.Item>
      </Tooltip>
    </>
  );
}
