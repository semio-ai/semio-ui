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
        "text-sm leading-none flex items-center",
        "h-8 px-[5px] relative pl-[30px] select-none outline-hidden",
        "data-disabled:pointer-events-none",
        "hover-list-item",
        variant,
      )}
    >
      {left && (
        <div
          className={clsx(
            "absolute left-0 w-[30px] inline-flex items-center justify-center",
            "check-indicator",
          )}
        >
          {left}
        </div>
      )}
      {children}
      {right && <div className={clsx("ml-auto pl-[20px]", "check-indicator")}>{right}</div>}
    </ItemComponent>
  );
}
