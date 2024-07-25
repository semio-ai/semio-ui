import { clsx } from "clsx";
import { CSSProperties, ReactNode } from "react";
import { altColor } from "@semio/utils";
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
  color?: string;
  size?: Size | "fit";
}
export function IconButton({
  children,
  disabled,
  onClick,
  variant,
  size,
  color,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "transition-all",
        // "hover:scale-[101%]",
        color && !disabled
          ? "hover:text-[--darker-color] hover:dark:text-[--lighter-color] text-[--text-color]"
          : getHoverTextStyles(variant),
        "place-items-center",
        size === "fit" ? "h-fit w-fit" : getHeight(size),
        // getFontSize(size),
        props.className ?? "",
      )}
      disabled={disabled}
      onClick={onClick}
      style={
        color
          ? ({
              "--text-color": color,
              "--darker-color": altColor(color, 0.2),
              "--lighter-color": altColor(color, -0.2),
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </button>
  );
}
