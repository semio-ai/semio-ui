import { type ReactNode } from "react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { ContextMenuLabel } from "@radix-ui/react-context-menu";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { getItemSideStyle } from "../variant-colors";
import { useNestedParent } from "./context";

export interface NestedLabelProps {
  variant?: Variant;
  children: ReactNode;
}

export function NestedLabel({ variant, children }: NestedLabelProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenuLabel : ContextMenuLabel;

  return (
    <ItemComponent
      className={clsx(
        "pl-[25px] text-xs leading-[25px] text-neutral-800 dark:text-neutral-200 font-bold",
      )}
    >
      {children}
    </ItemComponent>
  );
}
