import { type ReactNode } from "react";
import { Toggle as RadixToggle } from "radix-ui";
import { clsx } from "clsx";
import { Variant, Size } from "../types";
import { Tooltip } from "../floating/tooltip";

export interface ToggleSquareProps {
  variant?: Variant;
  /** Custom color applied as CSS custom property for themed coloring. */
  color?: string;
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
  color,
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
          color ? "custom-color" : variant,
          sizing === "default" && "sized-height sized-width",
          sizing === "inner" && "sized-inner-group-item",
          sizing === "list-item" && "sized-list-item-indicator",
          "rounded-xs",
          "flex items-center justify-center",
          // When a custom color is provided, use color-mixed backgrounds
          // instead of the theme-based variant-checkbox-bg.
          !color && (asIndicator ? "grid-list-item-indicator" : "variant-checkbox-bg"),
          !asIndicator && "variant-responsive-appearing-outline",
          "appearance-none",
          !color && "dark:data-[state=on]:text-neutral-800",
          !color && "data-[state=on]:text-neutral-200",
          !color && "dark:data-[state=off]:text-neutral-200",
          !color && "data-[state=off]:text-neutral-800",
        )}
        style={color ? {
          "--custom-color": color,
          backgroundColor: value
            ? `color-mix(in oklab, ${color} 80%, transparent)`
            : `color-mix(in oklab, ${color} 20%, transparent)`,
        } as React.CSSProperties : undefined}
        pressed={value}
        onPressedChange={onChange}
        aria-label={label ?? "Toggle Button"}
      >
        {children ?? ""}
      </RadixToggle.Root>
    </Tooltip>
  );
}
