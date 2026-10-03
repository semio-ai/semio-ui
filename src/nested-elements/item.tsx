import { DropdownMenu, ContextMenu } from "radix-ui";
import { clsx } from "clsx";
import { resolveIcon } from "../icons/registry";
import { Tooltip } from "../floating/tooltip";
import { NestedParent, type NestedItemProps } from "./types";
import { useNestedParent } from "./context";

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
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenu.Item : ContextMenu.Item;

  return (
    <Tooltip content={description} disabled={!description} side="right" variant={descriptionVariant}>
      <ItemComponent
        disabled={disabled}
        // Never while disabled, independent of `closeOnSelect`/pointer handling
        // below: Radix's own `disabled` only gates its OWN `onSelect` — a
        // consumer's `onClick` is composed onto the same DOM node and fires from
        // a real click regardless, which is the difference between a control
        // that merely LOOKS inert and one that is.
        onClick={disabled ? undefined : onClick}
        data-testid={testId}
        onSelect={(event: Event) => {
          if (!closeOnSelect) {
            event.preventDefault();
          }
        }}
        className={clsx(
          "group/item flex items-center rounded-xs leading-none",
          "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
          // Suppressed only when there is nothing to explain. `onClick` above is
          // already gated on `disabled`, so removing this costs only the "not
          // interactive" cursor and hover highlight — never a click going
          // through — and a description needs the pointer events this class
          // would remove: the tooltip's trigger is this same element, and a
          // reader who cannot hover it never learns why.
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
  );
}
