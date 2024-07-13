import { MouseEventHandler, type ReactNode } from "react";
import { clsx } from "clsx";
import { Variant, Size } from "../types";
import {
  getFontSize,
  getHeight,
  getHoverButtonStyles,
} from "../style-functions";

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
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Optional variant to apply to the button
   */
  variant?: Variant;
  /**
   * Optional left icon to add to the button
   */
  leftIcon?: ReactNode;
  /**
   * Optional right icon to add to the button
   */
  rightIcon?: ReactNode;
  size?: Size;
}
export function TextButton({
  children,
  disabled,
  onClick,
  variant,
  leftIcon,
  rightIcon,
  size,
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
        "pt-2 pb-2 pr-4 pl-4 flex items-center m-1",
        getFontSize(size),
        getHeight(size),
      )}
      disabled={disabled}
      onClick={onClick ?? ((_e) => {})}
    >
      {leftIcon}
      <div className="flex-1 ">{children}</div>
      {rightIcon}
    </button>
  );
}
