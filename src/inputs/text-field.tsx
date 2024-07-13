import { memo, type ReactNode, InputHTMLAttributes, useState } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { getHeight, getOutline } from "../style-functions";
import { StyledInput } from "./styled-input";

export interface TextFieldProps {
  onChange?: (value: string) => void;
  variant?: Variant;
  size?: Size;
}

/*
TextField is a component that allows the user to input text.
Inherits from standard Input HTML element
@props value: string - the value of the field
@props onChange: (value: string) => void - the callback to call when the value changes
@props size?: "sm" | "md" | "lg" - the size of the field
*/
function InnerTextField({
  size = Size.Md,
  onChange,
  variant,
  ...forwardedProps
}: TextFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange">): ReactNode {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={clsx(
        "relative flex items-baseline dark:bg-neutral-950/20 bg-neutral-50/20",
        focused && "outline outline-1 outline-offset-2",
        getOutline(variant),
        getHeight(size),
        "w-full",
      )}
    >
      <StyledInput
        {...forwardedProps}
        cursor="cursor-text"
        className="text-left absolute"
        size={size}
        onChange={onChange ? (e) => onChange(e.target.value) : () => {}}
        onFocus={(e) => {
          setFocused(true);
          if (forwardedProps.onFocus) forwardedProps.onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          if (forwardedProps.onBlur) forwardedProps.onBlur(e);
        }}
      />
    </div>
  );
}

export const TextField = memo(InnerTextField);
