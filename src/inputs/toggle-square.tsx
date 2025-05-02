import { type ReactNode } from "react";
import { Toggle as RadixToggle } from "radix-ui";
import { clsx } from "clsx";
import { Variant, Size } from "../types";
import { getToggleButtonStyles } from "../style-functions";
import { Tooltip } from "../floating/tooltip";

export interface ToggleSquareProps {
  variant?: Variant;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  children?: ReactNode;
  size?: Size;
}

export function ToggleSquare({
  variant,
  value,
  disabled,
  onChange,
  size,
  label,
  children,
}: ToggleSquareProps) {
  return (
    <Tooltip disabled={disabled} content={label ?? "Option"}>
      <RadixToggle.Root
        disabled={disabled}
        data-state={value ? "on" : "off"}
        className={clsx(
          size,
          variant,
          "sized-height sized-width",
          getToggleButtonStyles(variant ?? Variant.Default),
          "p-1",
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
