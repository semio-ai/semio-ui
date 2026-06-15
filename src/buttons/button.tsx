import {
  MouseEventHandler,
  forwardRef,
  type ReactNode,
  type CSSProperties,
  type ForwardedRef,
} from "react";
import { clsx } from "clsx";
import { Variant, Size } from "../types";
import { Icon } from "../icons/registry";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  altText?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  color?: string;
  /** A rendered icon node. Prefer {@link leftIconName} for registry icons. */
  leftIcon?: ReactNode;
  /** A rendered icon node. Prefer {@link rightIconName} for registry icons. */
  rightIcon?: ReactNode;
  /** Registry key rendered through `<Icon>`; takes precedence over {@link leftIcon}. */
  leftIconName?: string;
  /** Registry key rendered through `<Icon>`; takes precedence over {@link rightIcon}. */
  rightIconName?: string;
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
      leftIconName,
      rightIconName,
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
    // Name-based shorthands route through the registry `<Icon>` and win over a
    // raw node, so call sites can migrate to keys without dropping back-compat.
    const left = leftIconName ? <Icon name={leftIconName} /> : leftIcon;
    const right = rightIconName ? <Icon name={rightIconName} /> : rightIcon;
    const iconOnly = (!right && children === undefined) || (!left && children === undefined);

    return (
      <button
        ref={ref}
        type={submit ? "submit" : "button"}
        {...props}
        aria-label={altText}
        data-deemphasized={deemphasize}
        className={clsx(
          "responsive cursor-pointer select-none disabled:cursor-default",
          visuals === "default" &&
            "variant-responsive-bg variant-responsive-appearing-outline text-white dark:text-black",
          (visuals === "inverted" || visuals === "inverted-border") && "variant-responsive-text",
          visuals === "inverted" && "outline-hidden",
          visuals === "inverted-border" && "variant-responsive-persistent-outline",
          visuals === "call-to-action" && "cta-button",
          // For now we just inherit the parent styling in list items
          visuals === "list-item" && "",
          "grid grid-rows-1 place-items-center",
          left && children && right && "grid-cols-[auto_1fr_auto]",
          left && children && !right && "grid-cols-[auto_1fr]",
          !left && children && right && "grid-cols-[1fr_auto]",
          left && !children && right && "grid-cols-[auto_auto]",
          left && !children && !right && "grid-cols-[auto]",
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
        {left && (
          <div
            className={clsx(
              "grid place-items-center",
              size === "fit" ? "h-fit w-fit" : size,
              size !== "fit" && visuals !== "list-item" && "sized-text sized-height sized-width",
              size !== "fit" && visuals === "list-item" && "sized-text sized-list-item-indicator",
            )}
          >
            {left}
          </div>
        )}
        {children && (
          <div
            className={clsx(
              "grid place-items-center",
              left ? "" : "pl-1.5",
              right ? "" : "pr-1.5",
              size !== "fit" && "sized-height",
              size,
            )}
          >
            {children}
          </div>
        )}
        {right && (
          <div
            className={clsx(
              "grid place-items-center",
              size === "fit" ? "h-fit w-fit" : size,
              size !== "fit" && visuals !== "list-item" && "sized-text sized-height sized-width",
              size !== "fit" && visuals === "list-item" && "sized-text sized-list-item-indicator",
            )}
          >
            {right}
          </div>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
