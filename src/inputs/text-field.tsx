import { memo, type ReactNode, InputHTMLAttributes } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { getHeight, getOutline, getTextCaretColor } from "../style-functions";
import { StyledInput } from "./styled-input";

interface TextFieldAdditionalProps {
  onChange?: (value: string) => void;
  variant?: Variant;
  size?: Size;
  bg?: boolean;
}

export type TextFieldProps = TextFieldAdditionalProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange">;

/**
 * Inherits from standard Input HTML element
 * @param value - the value of the field
 * @param onChange - the callback to call when the value changes
 * @param size - the size of the field
 * @param variant - the variant of the field
 * @param bg - whether to show the field with a background
 */
function InnerTextField({
  size = Size.Md,
  onChange,
  variant,
  bg = false,
  ...forwardedProps
}: TextFieldProps): ReactNode {
  return (
    <div
      className={clsx(
        bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
        "relative flex w-full items-baseline",
        "focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
        getOutline(variant),
        getHeight(size),
        getTextCaretColor(variant),
      )}
    >
      <StyledInput
        {...forwardedProps}
        cursor="cursor-text"
        className="text-left absolute focus:placeholder-transparent"
        size={size}
        onChange={onChange ? (e) => onChange(e.target.value) : () => {}}
      />
    </div>
  );
}

export const TextField = memo(InnerTextField);
