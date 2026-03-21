import { DropdownMenu, ContextMenu } from "radix-ui";
import { clsx } from "clsx";
import { NestedParent, type NestedLabelProps } from "./types";
import { useNestedParent } from "./context";

/**
 * A component that renders a nested label with optional child labels.
 *
 * @param props - The props for the NestedLabel component ({@link NestedLabelProps}).
 * @returns The rendered NestedLabel component.
 */
export function NestedLabel({ children, className }: NestedLabelProps) {
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenu.Label : ContextMenu.Label;

  return (
    <ItemComponent
      className={clsx(
        "text-sm h-6 pl-3.75 leading-3.75 flex flex-row items-center",
        "text-neutral-800 dark:text-neutral-200 font-bold py-1.25",
        "responsive highlight-list-item",
        className,
      )}
    >
      {children}
    </ItemComponent>
  );
}
