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
}: NestedItemProps) {
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenu.Item : ContextMenu.Item;

  return (
    <ItemComponent
      disabled={disabled}
      onClick={onClick}
      onSelect={(event) => {
        if (!closeOnSelect) {
          event.preventDefault();
        }
      }}
      className={clsx(
        "leading-none flex items-center rounded-xs group/item",
        "h-7 text-sm px-[5px] relative pl-[30px] select-none outline-hidden",
        "data-disabled:pointer-events-none",
        "responsive highlight-list-item",
        variant,
      )}
    >
      {left && (
        <div
          className={clsx(
            "absolute left-1 inline-flex items-center justify-center",
            "responsive check-indicator list-item-extra highlight-list-item",
            variant,
          )}
        >
          {left}
        </div>
      )}
      {children}
      {right && (
        <div className={clsx("absolute right-1", "responsive list-item-extra", variant)}>
          {right}
        </div>
      )}
    </ItemComponent>
  );
}
