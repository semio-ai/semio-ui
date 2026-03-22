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
        "flex h-6 flex-row items-center pl-3.75 text-sm leading-3.75",
        "py-1.25 font-bold text-neutral-800 dark:text-neutral-200",
        "responsive highlight-list-item",
        className,
      )}
    >
      {children}
    </ItemComponent>
  );
}
