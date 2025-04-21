import {
  MouseEventHandler,
  forwardRef,
  type ReactNode,
  type CSSProperties,
  type ForwardedRef,
} from "react";
import { clsx } from "clsx";
import { alpha, altColor } from "@semio/utils";
import { Variant, Size } from "../types";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  callToAction?: boolean;
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
export const Button = forwardRef(
  (
    {
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
      callToAction = false,
      invert = false,
      border = false,
      submit = false,
      ...props
    }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const iconOnly =
      (!rightIcon && children === undefined) || (!leftIcon && children === undefined);

    return (
      <button
        ref={ref}
        type={submit ? "submit" : "button"}
        {...props}
        aria-label={altText}
        data-deemphasized={deemphasize}
        className={clsx(
          !invert &&
            !border &&
            !callToAction &&
            "variant-responsive-bg variant-responsive-appearing-outline text-black",
          invert && !callToAction && "variant-responsive-text",
          invert && border && !callToAction && "variant-responsive-persistent-outline",
          callToAction && "cta-button",
          "grid grid-rows-1 place-items-center",
          leftIcon && children && rightIcon && "grid-cols-[auto_1fr_auto]",
          leftIcon && children && !rightIcon && "grid-cols-[auto_1fr]",
          !leftIcon && children && rightIcon && "grid-cols-[1fr_auto]",
          leftIcon && !children && rightIcon && "grid-cols-[auto_auto]",
          leftIcon && !children && !rightIcon && "grid-cols-[auto]",
          size !== "fit" && size,
          size !== "fit" && "sized-text sized-height",
          size !== "fit" && iconOnly && "sized-width",
          color ? "custom-color" : variant,
          props.className ?? "",
        )}
        disabled={disabled}
        onClick={onClick}
        style={
          color
            ? ({
                "--custom-color": color,
                "--darker-custom-color": altColor(color, -0.1),
                "--lighter-custom-color": altColor(color, 0.2),
                "--deemphasized-custom-color": alpha(color, 0.5),
              } as CSSProperties)
            : undefined
        }
      >
        {leftIcon && (
          <div
            className={clsx(
              "grid place-items-center",
              size === "fit" ? "h-fit w-fit" : size,
              size !== "fit" && "sized-text sized-height sized-width",
            )}
          >
            {leftIcon}
          </div>
        )}
        {children && <div className="px-3 py-2">{children}</div>}
        {rightIcon && (
          <div
            className={clsx(
              "grid place-items-center",
              size === "fit" ? "h-fit w-fit" : size,
              size !== "fit" && "sized-text sized-height sized-width",
            )}
          >
            {rightIcon}
          </div>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
