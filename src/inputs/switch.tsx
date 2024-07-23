import type { ReactNode } from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { clsx } from "clsx";
import { Variant } from "../types";
import {
  getBasicTextColor,
  getCheckedBgStyles,
  getHoverButtonStyles,
} from "../style-functions";

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: Variant;
  offVariant?: Variant;
  onIcon?: ReactNode;
  offIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  square?: boolean;
}

export function Switch({
  value,
  onChange,
  disabled,
  variant,
  size,
  onIcon,
  offIcon,
  offVariant,
  square,
}: SwitchProps) {
  return (
    <HeadlessSwitch
      checked={value}
      onChange={onChange}
      disabled={disabled}
      className={clsx(
        "group inline-flex items-center transition translate duration-300",
        enclosureSize[size ?? "md"],
        !square && "rounded-full",
        getHoverButtonStyles(offVariant ?? Variant.Default),
        getCheckedBgStyles(variant),
      )}
    >
      <div
        className={clsx(
          "size-4 bg-white dark:bg-black transition ease-in-out duration-300 grid place-content-center",
          getBasicTextColor(value ? variant : offVariant ?? Variant.Default),
          !square && "rounded-full",
          buttonSize[size ?? "md"],
        )}
      >
        {value ? onIcon : offIcon}
      </div>
    </HeadlessSwitch>
  );
}

const enclosureSize = {
  sm: "h-4 w-8",
  md: "h-6 w-11",
  lg: "h-10 w-20",
};

const buttonSize = {
  sm: "size-3 translate-x-0.5 group-data-[checked]:translate-x-[18px]",
  md: "size-4 translate-x-1 group-data-[checked]:translate-x-6",
  lg: "size-8 translate-x-1 group-data-[checked]:translate-x-11",
};
