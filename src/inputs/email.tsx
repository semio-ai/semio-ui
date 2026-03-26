import { InputHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { Size, Variant } from "../types";
import { TextField } from "./text-field";
import { Label } from "./label";

export interface EmailInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  message?: string;
  size?: Size;
  variant?: Variant;
}

export const EmailInput = forwardRef(
  (
    {
      invalid = false,
      variant = Variant.Default,
      size = Size.Md,
      message = "",
      ...props
    }: EmailInputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const isEmpty = checkIsEmpty(ref);
    const usedVariant = invalid && !isEmpty ? Variant.Error : variant;

    const inputId = props.id ?? `email-${props.name ?? "default"}`;

    return (
      <Label
        label={props.name ?? "Email"}
        htmlFor={inputId}
        message={invalid ? message : undefined}
        variant={usedVariant}
      >
        <TextField
          bg
          ref={ref}
          id={inputId}
          size={size}
          variant={usedVariant}
          {...props}
          onChange={(_, event) => props.onChange?.(event)}
          outline="interact"
          className="w-full"
          aria-invalid={invalid}
        />
      </Label>
    );
  },
);

EmailInput.displayName = "EmailInput";

function checkIsEmpty(ref: ForwardedRef<HTMLInputElement>): boolean {
  if (typeof ref === "object") {
    return ref?.current?.value === "" || ref?.current?.value === undefined;
  } else if (typeof ref === "function") {
    return false;
  } else {
    return false;
  }
}
