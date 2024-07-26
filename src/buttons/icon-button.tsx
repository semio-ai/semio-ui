import { clsx } from "clsx";
import { CSSProperties, ReactNode } from "react";
import { alpha, altColor } from "@semio/utils";
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
  deemphasize?: boolean;
}
export function IconButton({
  children,
  disabled,
  onClick,
  variant,
  size,
  color,
  deemphasize,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "transition-all",
        // "hover:scale-[101%]",
        color &&
          !deemphasize &&
          !disabled &&
          "hover:text-[--darker-color] hover:dark:text-[--lighter-color] text-[--text-color]",
        color &&
          disabled &&
          "hover:text-[--text-deemphasized-color] hover:dark:text-[--text-deemphasized-color] text-[--text-deemphasized-color]",
        color &&
          deemphasize &&
          "hover:text-[--darker-deemphasized-color] hover:dark:text-[--lighter-deemphasized-color] text-[--text-deemphasized-color]",
        !color && getHoverTextStyles(variant),
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
              "--darker-color": altColor(color, -0.2),
              "--lighter-color": altColor(color, 0.2),
              "--text-deemphasized-color": alpha(color, 0.5),
              "--darker-deemphasized-color": alpha(altColor(color, -0.2), 0.5),
              "--lighter-deemphasized-color": alpha(altColor(color, 0.2), 0.5),
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </button>
  );
}
