import { InputHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { Size, Variant } from "../types";
import { TextField } from "./text-field";

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

    return (
      <label>
        <div className="flex flex-row justify-between items-center p-0.5">
          <span className="capitalize text-md text-neutral-500">{props.name ?? "Email"}</span>
          {invalid && <span className="text-xs text-error-500">{message}</span>}
        </div>
        <TextField
          bg
          ref={ref}
          size={size}
          variant={usedVariant}
          {...props}
          onChange={(_, event) => props.onChange?.(event)}
          outline="interact"
          className="w-full"
          aria-invalid={invalid}
        />

        {/* <div
          className={clsx(
            "dark:bg-neutral-800/80 bg-neutral-200/80",
            "dark:autofill:bg-neutral-800/80 autofill:bg-neutral-200/80",
            "focus-within:outline focus-within:outline-offset-2",
            usedVariant === Variant.Error && "outline outline-offset-2",
            getOutline(usedVariant),
            getTextCaretColor(usedVariant),
            getHeight(size),
          )}
        >
          <StyledInput ref={ref} size={size} {...props} />
        </div> */}
      </label>
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
