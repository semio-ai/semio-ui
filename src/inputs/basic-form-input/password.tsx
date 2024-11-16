import { InputHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { clsx } from "clsx";
import { getHeight, getOutline, getTextCaretColor } from "../../style-functions";
import { Size, Variant } from "../../types";
import { StyledInput } from "../styled-input";

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
        <div
          className={clsx(
            "dark:bg-neutral-800/80 bg-neutral-200/80",
            "focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
            usedVariant === Variant.Error && "outline outline-1 outline-offset-2",
            getOutline(usedVariant),
            getTextCaretColor(usedVariant),
            getHeight(size),
          )}
        >
          <StyledInput ref={ref} size={size} {...props} type={showPassword ? "text" : "password"} />
        </div>
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

// import { useState } from "react";
// import { Field, Input, Label } from "@headlessui/react";
// import { useInput } from "../../hooks/formInputHooks";

// export interface PasswordInputProps {
//   passwordValue: string;
//   onPasswordChange: (value: string, field: string) => void;
//   fieldName?: string;
//   inputTitle?: string;
//   inputPlaceholder?: string;
// }

// export function PasswordInput({
//   passwordValue,
//   fieldName = "password",
//   onPasswordChange,
//   inputTitle = "Password:",
//   inputPlaceholder = "Enter your password",
// }: PasswordInputProps) {
//   const { inputValue, handleChange, handleBlur } = useInput(
//     passwordValue,
//     onPasswordChange,
//     fieldName,
//   );

//   const [showPassword, setShowPassword] = useState<boolean>(false);

//   const toggleShowPassword = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <Field>
//       <Label className="block text-lg">{inputTitle}</Label>
//       <Input
//         type={showPassword ? "text" : "password"}
//         value={inputValue}
//         onChange={handleChange}
//         onBlur={handleBlur}
//         className="mt-1 block w-full rounded-md shadow dark:border border-slate-400 py-1 px-3 placeholder:font-thin
//           bg-inherit placeholder:text-inherit text-inherit"
//         placeholder={inputPlaceholder}
//       />
//       <button
//         type="button"
//         onClick={toggleShowPassword}
//         className="flex items-center text-sm leading-5"
//       >
//         {showPassword ? "Hide" : "Show Password"}
//       </button>
//     </Field>
//   );
// }
