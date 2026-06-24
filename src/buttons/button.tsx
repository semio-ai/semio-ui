import {
  MouseEventHandler,
  forwardRef,
  type ReactNode,
  type CSSProperties,
  type ForwardedRef,
} from "react";
import { clsx } from "clsx";
import { Variant, Size } from "../types";
import { resolveIcon, type IconValue } from "../icons/registry";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  altText?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  color?: string;
  /** Left icon: a registry key (e.g. `"trash"`) or a rendered node. */
  leftIcon?: IconValue;
  /** Right icon: a registry key (e.g. `"chevron-down"`) or a rendered node. */
  rightIcon?: IconValue;
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
    // A slot value may be a registry key (string) or a node; resolveIcon turns a
    // key into a self-sizing <Icon>, otherwise passes the node through.
    const left = resolveIcon(leftIcon);
    const right = resolveIcon(rightIcon);
    // Icon-only = no text and exactly one icon (square sizing). An empty button or
    // a two-icon button is not icon-only.
    const iconOnly = children === undefined && Boolean(left) !== Boolean(right);

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
