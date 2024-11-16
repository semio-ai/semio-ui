import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { IconCheck } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";
import { getHeight, getHoverTextStyles, getWidth } from "./style-functions";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onCheckedChange,
  variant = Variant.Default,
  size = Size.Md,
  disabled = false,
}: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      disabled={disabled}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={clsx(
        getWidth(size),
        getHeight(size),
        "flex items-center justify-center",
        "dark:bg-black bg-white outline-none",
        "appearance-none",
      )}
    >
      <RadixCheckbox.Indicator className={getHoverTextStyles(variant)}>
        <IconCheck size={getIconSize(size)} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

function getIconSize(size: Size): string {
  switch (size) {
    case Size.Xs:
      return "16px";
    case Size.Sm:
      return "24px";
    case Size.Md:
      return "28px";
    case Size.Lg:
      return "36px";
    default:
      return "28px";
  }
}
