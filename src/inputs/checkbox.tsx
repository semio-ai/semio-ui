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
}

export function Checkbox({
  id,
  checked,
  onCheckedChange,
  variant = Variant.Default,
  size = Size.Md,
  disabled = false,
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
        "sized-height sized-width rounded-xs",
        "flex items-center justify-center",
        "variant-checkbox-bg",
        "variant-responsive-appearing-outline",
        "appearance-none",
      )}
    >
      <RadixCheckbox.Indicator className={clsx(variant, "dark:text-black text-white")}>
        <IconCheck className="w-full h-full" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
