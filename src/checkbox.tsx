import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { IconCheck } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";
import {
  getBasicBgColor,
  getHeight,
  getHoverBorder,
  getHoverTextStyles,
  getWidth,
} from "./style-functions";

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
        getWidth(size),
        getHeight(size),
        "flex items-center justify-center",
        !invert && "dark:bg-black bg-white",
        invert && getBasicBgColor(variant),
        getHoverBorder(variant),
        "appearance-none outline-none",
      )}
    >
      <RadixCheckbox.Indicator className={invert ? "text-black" : getHoverTextStyles(variant)}>
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
