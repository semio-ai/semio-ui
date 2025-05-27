import { type ReactNode } from "react";
import { Toggle as RadixToggle } from "radix-ui";
import { clsx } from "clsx";
import { Variant, Size } from "../types";
import { Tooltip } from "../floating/tooltip";

export interface ToggleSquareProps {
  variant?: Variant;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  children?: ReactNode;
  size?: Size;
  sizing?: "default" | "inner" | "list-item";
  asIndicator?: boolean;
}

export function ToggleSquare({
  variant,
  value,
  disabled,
  onChange,
  size,
  label,
  children,
  sizing = "default",
  asIndicator = false,
}: ToggleSquareProps) {
  return (
    <Tooltip disabled={disabled} content={label ?? "Option"}>
      <RadixToggle.Root
        disabled={disabled}
        data-state={value ? "on" : "off"}
        className={clsx(
          "responsive",
          size,
          variant,
          sizing === "default" && "sized-height sized-width",
          sizing === "inner" && "sized-inner-group-item",
          sizing === "list-item" && "sized-list-item-indicator",
          "rounded-xs",
          "flex items-center justify-center",
          asIndicator ? "grid-list-item-indicator" : "variant-checkbox-bg",
          !asIndicator && "variant-responsive-appearing-outline",
          "appearance-none",
          "dark:data-[state=on]:text-neutral-800",
          "data-[state=on]:text-neutral-200",
          "dark:data-[state=off]:text-neutral-200",
          "data-[state=off]:text-neutral-800",
        )}
        pressed={value}
        onPressedChange={onChange}
        aria-label={label ?? "Toggle Button"}
      >
        {children ?? ""}
      </RadixToggle.Root>
    </Tooltip>
  );
}
