import {
  MouseEventHandler,
  forwardRef,
  type ReactNode,
  type CSSProperties,
  type ForwardedRef,
} from "react";
import { clsx } from "clsx";
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
  submit?: boolean;
  visuals?: "default" | "inverted" | "inverted-border" | "call-to-action" | "list-item";
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
      // callToAction = false,
      // invert = false,
      // border = false,
      submit = false,
      className,
      visuals = "default",
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
          "responsive select-none cursor-pointer disabled:cursor-default",
          visuals === "default" &&
            "variant-responsive-bg variant-responsive-appearing-outline text-white dark:text-black",
          (visuals === "inverted" || visuals === "inverted-border") && "variant-responsive-text",
          visuals === "inverted" && "outline-hidden",
          visuals === "inverted-border" && "variant-responsive-persistent-outline",
          visuals === "call-to-action" && "cta-button",
          // For now we just inherit the parent styling in list items
          visuals === "list-item" && "",
          "grid grid-rows-1 place-items-center",
          leftIcon && children && rightIcon && "grid-cols-[auto_1fr_auto]",
          leftIcon && children && !rightIcon && "grid-cols-[auto_1fr]",
          !leftIcon && children && rightIcon && "grid-cols-[1fr_auto]",
          leftIcon && !children && rightIcon && "grid-cols-[auto_auto]",
          leftIcon && !children && !rightIcon && "grid-cols-[auto]",
          size !== "fit" && size,
          size !== "fit" && visuals !== "list-item" && "sized-text sized-height",
          size !== "fit" && iconOnly && visuals !== "list-item" && "sized-width",
          size !== "fit" &&
            visuals === "list-item" &&
            "sized-text sized-list-item-indicator-height",
          size !== "fit" && iconOnly && visuals === "list-item" && "sized-list-item-indicator",
          color ? "custom-color" : variant,
          className,
        )}
        disabled={disabled}
        onClick={onClick}
        style={
          color
            ? ({
                "--custom-color": color,
              } as CSSProperties)
            : undefined
        }
      >
        {leftIcon && (
          <div
            className={clsx(
              "grid place-items-center",
              size === "fit" ? "h-fit w-fit" : size,
              size !== "fit" && visuals !== "list-item" && "sized-text sized-height sized-width",
              size !== "fit" && visuals === "list-item" && "sized-text sized-list-item-indicator",
            )}
          >
            {leftIcon}
          </div>
        )}
        {children && (
          <div
            className={clsx(
              "grid place-items-center",
              leftIcon ? "" : "pl-1.5",
              rightIcon ? "" : "pr-1.5",
              size !== "fit" && "sized-height",
              size,
            )}
          >
            {children}
          </div>
        )}
        {rightIcon && (
          <div
            className={clsx(
              "grid place-items-center",
              size === "fit" ? "h-fit w-fit" : size,
              size !== "fit" && visuals !== "list-item" && "sized-text sized-height sized-width",
              size !== "fit" && visuals === "list-item" && "sized-text sized-list-item-indicator",
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
