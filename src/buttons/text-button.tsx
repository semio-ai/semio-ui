import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant } from "../types";
import { getHoverButtonStyles } from "../variant-colors";

export interface TextButtonProps
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
export function TextButton({
  children,
  disabled,
  onClick,
  variant,
  ...props
}: TextButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "transition-colors",
        "dark:text-white text-black",
        getHoverButtonStyles(variant),
        "pt-2 pb-2 pr-4 pl-4",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
