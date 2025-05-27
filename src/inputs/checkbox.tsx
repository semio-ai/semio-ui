import { Checkbox as RadixCheckbox } from "radix-ui";
import { IconCheck } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  sizing: "default" | "inner" | "list-item";
  asIndicator?: boolean;
}

export function Checkbox({
  id,
  checked,
  onCheckedChange,
  variant = Variant.Default,
  size = Size.Md,
  disabled = false,
  sizing = "default",
  asIndicator = false,
}: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      id={id}
      disabled={disabled}
      checked={checked}
      onCheckedChange={onCheckedChange}
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
      )}
    >
      <RadixCheckbox.Indicator
        className={clsx(variant, "dark:text-black text-white", "grid place-items-center")}
      >
        <IconCheck className="w-4/5 h-4/5" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
