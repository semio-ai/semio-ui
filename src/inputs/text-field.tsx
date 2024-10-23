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

/*
TextField is a component that allows the user to input text.
Inherits from standard Input HTML element
@props value: string - the value of the field
@props onChange: (value: string) => void - the callback to call when the value changes
@props size?: "xs" | "sm" | "md" | "lg" - the size of the field
*/
function InnerTextField({
  size = Size.Md,
  onChange,
  variant,
  bg = false,
  ...forwardedProps
}: TextFieldProps): ReactNode {
  // const [focused, setFocused] = useState(false);

  return (
    <div
      className={clsx(
        bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
        "relative flex w-full items-baseline",
        "focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
        getOutline(variant),
        getHeight(size),
        getTextCaretColor(variant),
        // "w-full",
      )}
    >
      <StyledInput
        {...forwardedProps}
        cursor="cursor-text"
        className="text-left absolute focus:placeholder-transparent"
        size={size}
        onChange={onChange ? (e) => onChange(e.target.value) : () => {}}
        // onFocus={(e) => {
        //   setFocused(true);
        //   if (forwardedProps.onFocus) forwardedProps.onFocus(e);
        // }}
        // onBlur={(e) => {
        //   setFocused(false);
        //   if (forwardedProps.onBlur) forwardedProps.onBlur(e);
        // }}
      />
    </div>
  );
}

export const TextField = memo(InnerTextField);
