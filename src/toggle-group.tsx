import { type ReactNode } from "react";
import * as RadixToggleGroup from "@radix-ui/react-toggle-group";
import { clsx } from "clsx";
import { Variant, Size } from "./types";
import { getToggleButtonStyles, getHeight, getWidth } from "./style-functions";
import { Tooltip } from "./tooltip";

export interface ToggleGroupProps {
  variant?: Variant;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
    color?: string;
    icon?: ReactNode;
  }[];
  size?: Size;
}

export function ToggleGroup({ variant, value, onChange, options, size, label }: ToggleGroupProps) {
  return (
    <RadixToggleGroup.Root
      className={clsx("transition-all inline-flex items-center justify-center")}
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v);
      }}
      aria-label={label ?? "Toggle Group"}
    >
      {options.map((option) => (
        <Tooltip key={option.value} disabled={option.disabled} content={option.label ?? "Option"}>
          <RadixToggleGroup.Item
            key={option.value}
            data-state={value === option.value ? "on" : "off"}
            className={clsx(
              getHeight(size),
              getWidth(size),
              getToggleButtonStyles(variant ?? Variant.Default),
              "p-1",
            )}
            value={option.value}
            disabled={option.disabled}
            aria-label={option.label}
          >
            {option.icon}
          </RadixToggleGroup.Item>
        </Tooltip>
      ))}
    </RadixToggleGroup.Root>
  );
}
