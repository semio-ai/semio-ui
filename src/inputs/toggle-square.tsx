import { Children, Fragment, isValidElement, type CSSProperties, type ReactNode } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
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

/**
 * Whether children render anything. `Children.toArray` drops null, undefined and
 * booleans but keeps a fragment whole, so an empty fragment is looked inside: a
 * toggle with nothing in it keeps the unchecked edge that makes it visible.
 */
function rendersContent(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (child === "") return false;
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      return rendersContent(child.props.children);
    }
    return true;
  });
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
  const hasContent = rendersContent(children);

  return (
    <Tooltip disabled={disabled} content={label ?? "Option"}>
      <BaseCheckbox.Root
        disabled={disabled}
        nativeButton
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.preventBaseUIHandler();
          }
        }}
        render={(props, state) => (
          <button
            {...props}
            type="button"
            tabIndex={undefined}
            data-state={
              state.indeterminate ? "indeterminate" : state.checked ? "checked" : "unchecked"
            }
          />
        )}
        checked={value === true}
        indeterminate={value === "partial"}
        onCheckedChange={(checked) => onChange(checked)}
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
      </BaseCheckbox.Root>
    </Tooltip>
  );
}
