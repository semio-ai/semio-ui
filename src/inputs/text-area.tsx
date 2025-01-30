import {
  memo,
  forwardRef,
  type ReactNode,
  type ForwardedRef,
  type TextareaHTMLAttributes,
} from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { getOutline, getTextCaretColor, getInputStyles } from "../style-functions";
import { InputProps } from "./styled-input";

// interface TextFieldAdditionalProps {
//   onChange?: (value: string) => void;
//   variant?: Variant;
//   size?: Size;
//   bg?: boolean;
//   outline?: boolean;
//   subtle?: boolean;
// }

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "onChange"> {
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
const InnerTextArea = forwardRef(
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
    }: TextAreaProps,
    ref: ForwardedRef<HTMLTextAreaElement>,
  ): ReactNode => {
    return (
      <div
        className={clsx(
          bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
          "flex w-full items-baseline",
          outline && "focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
          getOutline(variant),
          getTextCaretColor(variant),
        )}
      >
        <StyledArea
          {...forwardedProps}
          ref={ref}
          cursor="cursor-text"
          subtle={subtle}
          className={clsx("text-left focus:placeholder-transparent", className)}
          size={size}
          onChange={onChange ? (e) => onChange(e.target.value) : () => {}}
        />
      </div>
    );
  },
);

InnerTextArea.displayName = "TextField";

export const TextArea = memo(InnerTextArea);

export const StyledArea = memo(
  forwardRef(
    (
      {
        size = Size.Md,
        cursor,
        className,
        flex = true,
        bold,
        subtle,
        ...forwardedProps
      }: InputProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
      ref: ForwardedRef<HTMLTextAreaElement>,
    ) => {
      return (
        <textarea
          name={forwardedProps.name ?? "StyledInput"}
          ref={ref}
          {...forwardedProps}
          className={getInputStyles(
            flex,
            subtle,
            bold,
            size,
            forwardedProps.disabled,
            className,
            cursor,
            false,
          )}
        />
      );
    },
  ),
);

StyledArea.displayName = "StyledArea";
