import React, { type ReactNode } from "react";
import * as RadixToggle from "@radix-ui/react-toggle";
import { clsx } from "clsx";
import { Variant, Size } from "./types";
import { getToggleButtonStyles, getHeight, getWidth } from "./style-functions";
import { Tooltip } from "./tooltip";

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
          getHeight(size),
          getWidth(size),
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
