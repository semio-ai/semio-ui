import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { useNestedParent } from "./context";

export interface NestedSeparatorProps {
  variant?: Variant;
}

export function NestedSeparator({ variant }: NestedSeparatorProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenuSeparator : ContextMenuSeparator;

  return (
    <ItemComponent
      className={clsx("h-[1px] m-[5px]", variant, "responsive variant-separator-fill")}
    />
  );
}
