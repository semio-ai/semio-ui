import { MouseEventHandler, type ReactNode, type CSSProperties } from "react";
import { clsx } from "clsx";
import { alpha, altColor } from "@semio/utils";
import { Variant, Size } from "../types";
import {
  getFontSize,
  getHeight,
  getHoverBorder,
  getHoverButtonStyles,
  getHoverTextStyles,
  getWidth,
} from "../style-functions";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  altText?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  color?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: Size | "fit";
  deemphasize?: boolean;
  invert?: boolean;
  border?: boolean;
  submit?: boolean;
}

/**
 * A button that displays text and/or icons. If no text and one icon is provided, the button will be a square with padding.
 * @param children - The text to display on the button
 * @param altText - The alt text to accompany the button
 * @param disabled - Whether the button is disabled
 * @param onClick - Optional click handler
 * @param variant - Optional variant to apply to the button (default is "default")
 * @param color - Optional custom color to apply to the button
 * @param leftIcon - Optional left icon to add to the button
 * @param rightIcon - Optional right icon to add to the button
 * @param size - Optional size to apply to the button
 * @param deemphasize - Whether to deemphasize the button (subtler background and colored text)
 * @param invert - Whether to invert the button colors (no background and colored text)
 * @param border - Whether to add a border to the button
 */
export function Button({
  children,
  altText,
  disabled,
  onClick,
  variant,
  color,
  leftIcon,
  rightIcon,
  size = Size.Md,
  deemphasize = false,
  invert = false,
  border = false,
  submit = false,
  ...props
}: ButtonProps) {
  const iconOnly = (!rightIcon && children === undefined) || (!leftIcon && children === undefined);
  return (
    <button
      type={submit ? "submit" : "button"}
      {...props}
      aria-label={altText}
      data-deemphasized={deemphasize}
      className={clsx(
        "transition-colors",
        "flex items-center",
        size === "fit" ? "h-fit w-fit" : getHeight(size),
        size !== "fit" && getFontSize(size),
        getPaddingAndWidth(size, iconOnly),
        iconOnly && "place-items-center",
        !color && !invert && "dark:text-black text-white",
        !color && (invert ? getHoverTextStyles(variant) : getHoverButtonStyles(variant)),
        color &&
          clsx(
            "hover:text-[--darker-color] hover:dark:text-[--lighter-color] text-[--text-color]",
            "disabled:hover:text-[--text-deemphasized-color]",
            "disabled:hover:dark:text-[--text-deemphasized-color]",
            "disabled:text-[--text-deemphasized-color]",
            "data-[deemphasized=true]:hover:text-[--darker-deemphasized-color]",
            "data-[deemphasized=true]:hover:dark:text-[--lighter-deemphasized-color]",
            "data-[deemphasized=true]:text-[--text-deemphasized-color]",
          ),
        color &&
          border &&
          clsx(
            "border border-solid",
            "hover:border-[--darker-color] hover:dark:border-[--lighter-color] border-[--text-color]",
            "disabled:hover:border-[--text-deemphasized-color]",
            "disabled:hover:dark:border-[--text-deemphasized-color]",
            "disabled:border-[--text-deemphasized-color]",
            "data-[deemphasized=true]:hover:border-[--darker-deemphasized-color]",
            "data-[deemphasized=true]:hover:dark:border-[--lighter-deemphasized-color]",
            "data-[deemphasized=true]:border-[--text-deemphasized-color]",
          ),
        border && !color && getHoverBorder(variant),

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
      {leftIcon}
      <div className="flex-1">{children}</div>
      {rightIcon}
    </button>
  );
}

function getPaddingAndWidth(size: Size | "fit", onlyIcon: boolean): string {
  if (size === "fit") {
    return "";
  } else if (onlyIcon) {
    return clsx("p-2", getWidth(size));
  } else {
    return "py-2 px-4";
  }
}
