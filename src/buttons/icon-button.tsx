import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant } from "../types";
import { getHoverTextStyles } from "../variant-colors";

export interface IconButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * The text to display on the button
   */
  children: ReactNode;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Optional variant to apply to the button
   */
  variant?: Variant;
}
export function IconButton({
  children,
  disabled,
  onClick,
  variant,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx("transition-colors", getHoverTextStyles(variant), "p-2")}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
