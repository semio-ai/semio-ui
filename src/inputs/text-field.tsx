import {
  memo,
  forwardRef,
  type ReactNode,
  type InputHTMLAttributes,
  type ForwardedRef,
  type ChangeEvent,
  type MouseEvent,
  type CSSProperties,
} from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { Icon } from "../icons/registry";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: Variant;
  color?: string;
  icon?: ReactNode;
  size?: Size;
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  subtle?: boolean;
  wrapperClassName?: string;
}

/**
 * Inherits from standard Input HTML element
 * @param value - the value of the field
 * @param onChange - the callback to call when the value changes
 * @param onClear - a callback to call when the clear button is clicked. Note, this does not clear the field.
 * @param size - the size of the field
 * @param variant - the variant of the field
 * @param color - [optional] custom color to override the variant
 * @param icon - [optional] the icon to show on the left side of the field
 * @param bg - whether to show the field with a background
 * @param outline - whether to show the field with an outline on focus
 * @param subtle - whether to make the text field subtle when not focused
 * @param wrapperClassName - [optional] the class name to apply to the wrapper element
 */
const InnerTextField = forwardRef(
  (
    {
      size = Size.Md,
      onChange,
      onClear,
      variant = Variant.Default,
      color,
      icon,
      bg = false,
      outline = "interact",
      className,
      wrapperClassName,
      subtle,
      ...forwardedProps
    }: TextFieldProps,
    ref: ForwardedRef<HTMLInputElement>,
  ): ReactNode => {
    return (
      <div
        style={
          {
            "--custom-color": color,
          } as CSSProperties
        }
        className={clsx(
          "relative flex flex-row outline-hidden",
          "sized-height",
          size,
          wrapperClassName,
        )}
      >
        <input
          ref={ref}
          {...forwardedProps}
          onChange={(event) => onChange?.(event.target.value, event)}
          className={clsx(
            "responsive",
            bg && "bg-neutral-50/20 dark:bg-neutral-950/20",
            "rounded-xs",
            outline === "interact" &&
              !forwardedProps.readOnly &&
              "variant-responsive-appearing-outline",
            outline === "always" &&
              !forwardedProps.readOnly &&
              "variant-responsive-persistent-outline",
            outline === "hidden" && "outline-hidden focus:outline-hidden",
            size,
            color ? "custom-color" : variant,
            "peer cursor-text disabled:cursor-not-allowed",
            "sized-text sized-height flex min-w-10 flex-1",
            icon ? "sized-inner-group-left-padding" : "pl-1",
            onClear ? "sized-inner-group-right-padding" : "pr-1",
            "variant-text-caret-color",
            !subtle && "text-black dark:text-white",
            className,
          )}
        />
        {icon && (
          <span
            className={clsx(
              color ? "custom-color" : variant,
              size,
              "responsive pointer-events-none absolute top-0.5 left-0.5 grid place-items-center",
              "sized-inner-group-item variant-responsive-input-extra-text rounded-[1px]",
            )}
          >
            {icon}
          </span>
        )}
        {onClear && (
          <button
            type="button"
            className={clsx(
              color ? "custom-color" : variant,
              size,
              "absolute top-0.5 right-0.5 hidden place-items-center peer-focus:grid",
              "responsive transition-all transition-discrete delay-75",
              "sized-inner-group-item variant-responsive-input-extra-button-text rounded-[1px]",
            )}
            onClick={(e) => {
              // e.stopPropagation();
              onClear?.(e);
            }}
          >
            <Icon name="x" />
          </button>
        )}
      </div>
    );
  },
);

InnerTextField.displayName = "TextField";

export const TextField = memo(InnerTextField);
