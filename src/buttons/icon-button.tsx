import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant, Size } from "../types";
import { getFontSize, getHeight, getHoverTextStyles } from "../style-functions";

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
  size?: Size;
}
export function IconButton({
  children,
  disabled,
  onClick,
  variant,
  size,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "transition-all",
        // "hover:scale-[101%]",
        getHoverTextStyles(variant),
        "place-items-center",
        getHeight(size),
        getFontSize(size),
        props.className ?? "",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
