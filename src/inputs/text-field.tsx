import {
  memo,
  forwardRef,
  type ReactNode,
  type InputHTMLAttributes,
  type ForwardedRef,
  type ChangeEvent,
} from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  variant?: Variant;
  size?: Size;
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  subtle?: boolean;
}

/**
 * Inherits from standard Input HTML element
 * @param value - the value of the field
 * @param onChange - the callback to call when the value changes
 * @param size - the size of the field
 * @param variant - the variant of the field
 * @param bg - whether to show the field with a background
 * @param outline - whether to show the field with an outline on focus
 */
const InnerTextField = forwardRef(
  (
    {
      size = Size.Md,
      onChange,
      variant = Variant.Default,
      bg = false,
      outline = "interact",
      className,
      subtle,
      ...forwardedProps
    }: TextFieldProps,
    ref: ForwardedRef<HTMLInputElement>,
  ): ReactNode => {
    return (
      <input
        ref={ref}
        {...forwardedProps}
        onChange={(event) => onChange?.(event.target.value, event)}
        className={clsx(
          bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
          "rounded-xs",
          outline === "interact" && "variant-responsive-appearing-outline",
          outline === "always" && "variant-responsive-persistent-outline",
          size,
          variant,
          "disabled:cursor-not-allowed cursor-text",
          "sized-text sized-height px-1",
          "variant-text-carent-color",
          subtle && "dark:focus:text-white focus:text-black text-neutral-600 dark:text-neutral-400",
          !subtle && "text-black dark:text-white",
          className,
        )}
      />
    );
  },
);

InnerTextField.displayName = "TextField";

export const TextField = memo(InnerTextField);
