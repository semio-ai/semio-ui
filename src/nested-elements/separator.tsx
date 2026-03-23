import { DropdownMenu, ContextMenu } from "radix-ui";
import { clsx } from "clsx";
import { NestedParent, NestedSeparatorProps } from "./types";
import { useNestedParent } from "./context";

/**
 * A component that renders a separator in a nested menu.
 *
 * @param props - The props for the NestedSeparator component ({@link NestedSeparatorProps}).
 * @returns The rendered NestedSeparator component.
 */
export function NestedSeparator({ variant }: NestedSeparatorProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.Separator : ContextMenu.Separator;

  return (
    <ItemComponent
      className={clsx(
        "m-[5px] h-[1px]",
        variant,
        "responsive variant-separator-fill pointer-events-none select-none",
      )}
    />
  );
}
