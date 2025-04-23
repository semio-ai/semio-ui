import { ReactNode } from "react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { ContextMenuItem } from "@radix-ui/react-context-menu";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { useNestedParent } from "./context";

export interface NestedItemProps {
  left?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export function NestedItem({ left, children, right, variant, disabled, onClick }: NestedItemProps) {
  const parent = useNestedParent();

  const ItemComponent = parent === NestedParent.Dropdown ? DropdownMenuItem : ContextMenuItem;

  return (
    <ItemComponent
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "leading-none flex items-center rounded-xs group/item",
        "h-7 text-sm px-[5px] relative pl-[30px] select-none outline-hidden",
        "data-disabled:pointer-events-none",
        "highlight-list-item",
        variant,
      )}
    >
      {left && (
        <div
          className={clsx(
            "absolute left-1 inline-flex items-center justify-center",
            "check-indicator",
            variant,
          )}
        >
          {left}
        </div>
      )}
      {children}
      {right && <div className={clsx("absolute right-1", "list-item-extra", variant)}>{right}</div>}
    </ItemComponent>
  );
}
