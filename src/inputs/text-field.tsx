import {
  memo,
  forwardRef,
  type ReactNode,
  type InputHTMLAttributes,
  type ForwardedRef,
} from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { getHeight, getOutline, getTextCaretColor } from "../style-functions";
import { StyledInput } from "./styled-input";

// interface TextFieldAdditionalProps {
//   onChange?: (value: string) => void;
//   variant?: Variant;
//   size?: Size;
//   bg?: boolean;
//   outline?: boolean;
//   subtle?: boolean;
// }

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  onChange?: (value: string) => void;
  variant?: Variant;
  size?: Size;
  bg?: boolean;
  outline?: boolean;
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
      outline = true,
      className,
      subtle,
      ...forwardedProps
    }: TextFieldProps,
    ref: ForwardedRef<HTMLInputElement>,
  ): ReactNode => {
    return (
      <div
        className={clsx(
          bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
          "relative flex w-full items-baseline",
          outline && "focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
          getOutline(variant),
          getHeight(size),
          getTextCaretColor(variant),
        )}
      >
        <StyledInput
          {...forwardedProps}
          ref={ref}
          cursor="cursor-text"
          subtle={subtle}
          className={clsx("text-left absolute focus:placeholder-transparent", className)}
          size={size}
          onChange={onChange ? (e) => onChange(e.target.value) : () => {}}
        />
      </div>
    );
  },
);

InnerTextField.displayName = "TextField";

export const TextField = memo(InnerTextField);
