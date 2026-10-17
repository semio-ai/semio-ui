import { useId, type MouseEvent } from "react";
import { DropdownMenu, ContextMenu } from "radix-ui";
import { clsx } from "clsx";
import { useMenuAction } from "../floating/menu-action";
import { resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
import { NestedParent, type NestedItemProps } from "./types";
import { useNestedParent } from "./context";
import { disabledReason } from "./disabled-reason";

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
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenu.Item : ContextMenu.Item;
  const reason = disabledReason(disabled, description, useId());

  return (
    <>
      {reason.reasonElement}
      <Tooltip
        content={description}
        disabled={!description}
        side="right"
        variant={descriptionVariant}
      >
        <ItemComponent
          disabled={reason.primitiveDisabled}
          {...reason.itemProps}
          // Never while disabled, independent of `closeOnSelect`/pointer handling
          // below: Radix's own `disabled` only gates its OWN `onSelect` — a
          // consumer's `onClick` is composed onto the same DOM node and fires from
          // a real click regardless, which is the difference between a control
          // that merely LOOKS inert and one that is.
          onClick={
            disabled || !onClick
              ? undefined
              : (event) => {
                  if (!closeOnSelect) {
                    onClick(event);
                    return;
                  }
                  event.stopPropagation();
                  // React clears currentTarget after dispatch; the action receives the
                  // selected item even when it runs after the menu has unmounted.
                  const actionEvent = Object.create(event) as MouseEvent;
                  actionEvent.currentTarget = event.currentTarget;
                  runAction(() => onClick(actionEvent), closeOnSelect);
                }
          }
          data-testid={testId}
          onSelect={(event: Event) => {
            // A disabled entry with a reason is reachable, so Enter and a click
            // reach Radix's select; preventing it keeps the menu open on it.
            if (reason.explained || !closeOnSelect) {
              event.preventDefault();
            }
          }}
          className={clsx(
            "group/item flex items-center rounded-xs leading-none",
            "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
            // Suppressed only when there is nothing to explain. A description needs
            // the pointer events this class would remove: the tooltip's trigger is
            // this same element, and a reader who cannot hover it never learns why.
            // Keeping them is safe because `onClick` above is gated on `disabled`
            // and `onSelect` is prevented, so no click goes through.
            !description && "data-disabled:pointer-events-none",
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
        </ItemComponent>
      </Tooltip>
    </>
  );
}
