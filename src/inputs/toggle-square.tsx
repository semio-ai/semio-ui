import { type CSSProperties, type ReactNode } from "react";
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
          "responsive",
          size,
          color ? "custom-color" : variant,
          sizing === "default" && "sized-height sized-width",
          sizing === "inner" && "sized-inner-group-item",
          sizing === "list-item" && "sized-list-item-indicator",
          "rounded-xs",
          "flex items-center justify-center",
          asIndicator ? "grid-list-item-indicator" : "variant-checkbox-bg",
          !asIndicator && "variant-responsive-appearing-outline",
          "appearance-none",
          // Checked, the two sizings fill from different places, so the foreground
          // differs too. `variant-checkbox-bg` fills with `--standard-color`, which has
          // no dark-mode override — a theme-flipped pair there is wrong in one theme for
          // every hue. `grid-list-item-indicator` fills with `bg-layout-*-base`, which
          // does flip, so flipping with it is correct.
          !color && !asIndicator && "data-[state=checked]:text-[var(--on-standard-color)]",
          !color && asIndicator && "dark:data-[state=checked]:text-neutral-800",
          !color && asIndicator && "data-[state=checked]:text-neutral-200",
          !color && "dark:data-[state=unchecked]:text-neutral-200",
          !color && "data-[state=unchecked]:text-neutral-800",
          !color && "dark:data-[state=indeterminate]:text-neutral-200",
          !color && "data-[state=indeterminate]:text-neutral-800",
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
