import { Children, type CSSProperties, type ReactNode } from "react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import { clsx } from "clsx";
import { Variant, Size } from "../types";
import { Tooltip } from "../floating/tooltip";

export interface ToggleSquareProps {
  variant?: Variant;
  /** Custom color applied as CSS custom property for themed coloring. */
  color?: string;
  /**
   * Toggle state:
   * - `true` — on/checked (full color background)
   * - `false` — off/unchecked (subtle or default background)
   * - `"partial"` — indeterminate (off background + inset colored border)
   */
  value: boolean | "partial";
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
  // Map our tri-state to Radix Checkbox's checked prop
  const checked: boolean | "indeterminate" = value === "partial" ? "indeterminate" : value;
  const hasContent = Children.toArray(children).some((child) => child !== "");

  return (
    <Tooltip disabled={disabled} content={label ?? "Option"}>
      <RadixCheckbox.Root
        disabled={disabled}
        checked={checked}
        data-state={value === "partial" ? "indeterminate" : value ? "checked" : "unchecked"}
        onCheckedChange={(next) => {
          // Radix fires with boolean | "indeterminate"
          // Coerce to boolean: indeterminate → true (toggle on)
          onChange(next === "indeterminate" ? true : Boolean(next));
        }}
        className={clsx(
          "variant-scope",
          size,
          color ? "custom-color" : variant,
          sizing === "default" && "sized-height sized-width",
          sizing === "inner" && "sized-inner-group-item",
          sizing === "list-item" && "sized-list-item-indicator",
          "rounded-xs",
          "flex items-center justify-center",
          asIndicator ? "grid-list-item-indicator" : "variant-checkbox-bg",
          !asIndicator && hasContent && "toggle-square-content",
          !asIndicator && "variant-responsive-appearing-outline",
          "appearance-none",
          // No foreground named here. Each of the two sizings fills from a different
          // place — `variant-checkbox-bg` from `--standard-color`, which does not flip
          // with the theme, and `grid-list-item-indicator` from `bg-layout-*-base`,
          // which does — so the right foreground differs between them and neither can
          // be chosen from this call site. Both classes declare their own, next to the
          // fill they have to contrast against.
        )}
        style={color ? ({ "--custom-color": color } as CSSProperties) : undefined}
        aria-label={label ?? "Toggle Button"}
      >
        {/* Render children directly — not inside Indicator.
            The icon is always visible; its appearance changes based on state. */}
        {children ?? ""}
      </RadixCheckbox.Root>
    </Tooltip>
  );
}
