import { ForwardedRef, forwardRef } from "react";
import { clsx } from "clsx";
import type { IconValue } from "../icons/registry";
import { Button, ButtonProps } from "./button";

export interface HeaderButtonProps
  extends Omit<
    ButtonProps,
    | "submit"
    | "color"
    | "deemphasize"
    | "invert"
    | "border"
    | "callToAction"
    | "leftIcon"
    | "rightIcon"
    | "alt"
    | "children"
  > {
  label: string;
  icon: IconValue;
}

function InnerHeaderButton(
  { label, icon, className, ...forwardedProps }: HeaderButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <Button
      ref={ref}
      rightIcon={icon}
      className={clsx("variant-responsive-header-button-bg", className)}
      visuals="inverted"
      altText={label}
      {...forwardedProps}
    />
  );
}

export const HeaderButton = forwardRef(InnerHeaderButton);
