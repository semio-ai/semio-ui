import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { IconCheck } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";
import { getBasicBgColor, getHoverBorder, getHoverTextStyles } from "./style-functions";

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
        size,
        variant,
        "sized-height sized-width",
        "flex items-center justify-center",
        !invert && "dark:bg-black bg-white",
        invert && getBasicBgColor(variant),
        getHoverBorder(variant),
        "appearance-none outline-hidden",
      )}
    >
      <RadixCheckbox.Indicator
        className={clsx(variant, invert ? "text-black" : getHoverTextStyles(variant))}
      >
        <IconCheck className="w-full h-full" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
