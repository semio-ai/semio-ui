import { Checkbox as RadixCheckbox } from "radix-ui";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { Icon } from "../icons/registry";

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  sizing?: "default" | "inner" | "list-item";
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
        // h-full/w-full so the check's `h-4/5` percentage resolves against the
        // sized Root and scales with `size` (the box is `sized-height/width`).
        className={clsx(variant, "text-white dark:text-black", "grid h-full w-full place-items-center")}
      >
        <Icon name="selected" size="none" className="h-4/5 w-4/5" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
