import { type ReactNode } from "react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { ContextMenuLabel } from "@radix-ui/react-context-menu";
import { clsx } from "clsx";
import { NestedParent } from "../types";
import { useNestedParent } from "./context";

export interface NestedLabelProps {
  children: ReactNode;
}

export function NestedLabel({ children }: NestedLabelProps) {
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenuLabel : ContextMenuLabel;

  return (
    <ItemComponent
      className={clsx(
        "text-sm h-7 pl-[25px] leading-[25px] flex flex-row items-center",
        "text-neutral-800 dark:text-neutral-200 font-bold py-[5px]",
      )}
    >
      {children}
    </ItemComponent>
  );
}
