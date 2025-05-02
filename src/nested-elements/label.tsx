import { DropdownMenu, ContextMenu } from "radix-ui";
import { clsx } from "clsx";
import { NestedParent, type NestedLabelProps } from "./types";
import { useNestedParent } from "./context";

export function NestedLabel({ children, className }: NestedLabelProps) {
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenu.Label : ContextMenu.Label;

  return (
    <ItemComponent
      className={clsx(
        "text-sm h-6 pl-[15px] leading-[15px] flex flex-row items-center",
        "text-neutral-800 dark:text-neutral-200 font-bold py-[5px]",
        "responsive highlight-list-item",
        className,
      )}
    >
      {children}
    </ItemComponent>
  );
}
