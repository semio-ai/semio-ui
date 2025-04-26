import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { IconCheck } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  invert?: boolean;
}

export function Checkbox({
  id,
  checked,
  onCheckedChange,
  variant = Variant.Default,
  size = Size.Md,
  disabled = false,
  invert = false,
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
        invert && "dark:bg-black bg-white",
        !invert && "variant-responsive-bg",
        "variant-responsive-appearing-outline",
        "appearance-none",
      )}
    >
      <RadixCheckbox.Indicator
        className={clsx(variant, invert ? "variant-responsive-text" : "text-black")}
      >
        <IconCheck className="w-full h-full transtion-colors" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
