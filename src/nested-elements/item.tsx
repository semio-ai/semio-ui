import { DropdownMenu, ContextMenu } from "radix-ui";
import { clsx } from "clsx";
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
}: NestedItemProps) {
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenu.Item : ContextMenu.Item;

  return (
    <ItemComponent
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      onSelect={(event: Event) => {
        if (!closeOnSelect) {
          event.preventDefault();
        }
      }}
      className={clsx(
        "group/item flex items-center rounded-xs leading-none",
        "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
        "data-disabled:pointer-events-none",
        "responsive highlight-list-item",
        variant,
      )}
    >
      {left && (
        <div
          className={clsx(
            "absolute top-1/2 left-1 inline-flex -translate-y-1/2 items-center justify-center",
            "responsive list-item-extra highlight-list-item",
            variant,
          )}
        >
          {/* Definite-size square that centers the icon and normalizes its size, so
              icons from any set (Solar 1em / Tabler 24 / Semio) land at the same size
              and x-offset instead of shifting with their own intrinsic width. */}
          <span className="grid size-5 place-items-center [&_svg]:h-3/5 [&_svg]:w-3/5 [&_svg]:shrink-0">
            {left}
          </span>
        </div>
      )}
      {children}
      {right && (
        <div
          className={clsx(
            "absolute top-1/2 right-1 inline-flex -translate-y-1/2 items-center justify-center",
            "responsive list-item-extra",
            variant,
          )}
        >
          {right}
        </div>
      )}
    </ItemComponent>
  );
}
