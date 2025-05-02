import {
  memo,
  forwardRef,
  type ReactNode,
  type InputHTMLAttributes,
  type ForwardedRef,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
import { Size, Variant } from "../types";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: Variant;
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
        className={clsx(
          "relative outline-hidden flex flex-row",
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
            bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
            "rounded-xs",
            outline === "interact" && "variant-responsive-appearing-outline",
            outline === "always" && "variant-responsive-persistent-outline",
            outline === "hidden" && "outline-hidden focus:outline-hidden",
            size,
            variant,
            "disabled:cursor-not-allowed cursor-text peer",
            "sized-text sized-height flex flex-1 min-w-10",
            icon ? "sized-inner-group-left-padding" : "pl-1",
            onClear ? "sized-inner-group-right-padding" : "pr-1",
            "variant-text-caret-color",
            subtle &&
              "dark:focus:text-white focus:text-black text-neutral-600 dark:text-neutral-400",
            !subtle && "text-black dark:text-white",
            className,
          )}
        />
        {icon && (
          <span
            className={clsx(
              variant,
              size,
              "responsive absolute left-0.5 top-0.5 grid place-items-center pointer-events-none",
              "sized-inner-group-item rounded-[1px] variant-responsive-input-extra-text",
            )}
          >
            {icon}
          </span>
        )}
        {onClear && (
          <button
            type="button"
            className={clsx(
              variant,
              size,
              "absolute right-0.5 top-0.5 place-items-center hidden peer-focus:grid",
              "transition-discrete transition-all delay-75 responsive",
              "sized-inner-group-item rounded-[1px] variant-responsive-input-extra-button-text",
            )}
            onClick={(e) => {
              // e.stopPropagation();
              onClear?.(e);
            }}
          >
            <IconX className="w-3/5 h-3/5" />
          </button>
        )}
      </div>
    );
  },
);

InnerTextField.displayName = "TextField";

export const TextField = memo(InnerTextField);
