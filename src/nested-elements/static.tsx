import { DropdownMenu, ContextMenu } from "radix-ui";
import { clsx } from "clsx";
import { NestedParent, type NestedStaticProps } from "./types";
import { useNestedParent } from "./context";

/**
 * A component that renders static content in a nested menu.
 *
 * @param props - The props for the NestedStatic component ({@link NestedStaticProps}).
 * @returns The rendered NestedStatic component.
 */
export function NestedStatic({ children, className }: NestedStaticProps) {
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenu.Label : ContextMenu.Label;

  return (
    <ItemComponent
      className={clsx(
        "text-sm min-h-6 flex flex-row items-center",
        "text-neutral-800 dark:text-neutral-200",
        className,
      )}
    >
      {children}
    </ItemComponent>
  );
}
