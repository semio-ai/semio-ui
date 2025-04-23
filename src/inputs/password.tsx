import { InputHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { Size, Variant } from "../types";
import { TextField } from "./text-field";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  message?: string;
  size?: Size;
  variant?: Variant;
  showPassword?: boolean;
}

export const PasswordInput = forwardRef(
  (
    {
      invalid = false,
      message = "",
      variant = Variant.Default,
      size = Size.Md,
      showPassword = false,
      ...props
    }: PasswordInputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const isEmpty = checkIsEmpty(ref);
    const usedVariant = invalid && !isEmpty ? Variant.Error : variant;

    return (
      <label className="capitalize">
        <div className="flex flex-row justify-between items-center p-0.5">
          <span className="capitalize text-md text-neutral-500">{props.name ?? "Password"}</span>
          {invalid && <span className="text-xs text-error-500">{message}</span>}
        </div>
        <TextField
          bg
          ref={ref}
          size={size}
          variant={usedVariant}
          type={showPassword ? "text" : "password"}
          {...props}
          onChange={(_, event) => props.onChange?.(event)}
          outline="interact"
          className="w-full"
          aria-invalid={invalid}
        />
      </label>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

function checkIsEmpty(ref: ForwardedRef<HTMLInputElement>): boolean {
  if (typeof ref === "object") {
    return ref?.current?.value === "" || ref?.current?.value === undefined;
  } else if (typeof ref === "function") {
    return false;
  } else {
    return false;
  }
}
