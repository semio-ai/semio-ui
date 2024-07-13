import { ReactNode } from "react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { ContextMenuItem } from "@radix-ui/react-context-menu";
import { clsx } from "clsx";
import { NestedParent, Variant } from "../types";
import { getItemSideStyle, getItemStyle } from "../style-functions";
import { useNestedParent } from "./context";

export interface NestedItemProps {
  left?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export function NestedItem({
  left,
  children,
  right,
  variant,
  disabled,
  onClick,
}: NestedItemProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenuItem : ContextMenuItem;

  return (
    <ItemComponent
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "text-[13px] leading-none flex items-center",
        "h-[25px] px-[5px] relative pl-[30px] select-none outline-none",
        "data-[disabled]:pointer-events-none",
        getItemStyle(variant),
      )}
    >
      {left && (
        <div
          className={clsx(
            "absolute left-0 w-[30px] inline-flex items-center justify-center",
            getItemSideStyle(variant),
          )}
        >
          {left}
        </div>
      )}
      {children}
      {right && (
        <div className={clsx("ml-auto pl-[20px]", getItemSideStyle(variant))}>
          {right}
        </div>
      )}
    </ItemComponent>
  );
}
