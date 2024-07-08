import { useState } from "react";
import { Field, Input, Label } from '@headlessui/react'
import { useInput } from "../hooks/formInputHooks";

export interface PasswordInputProps {
  passwordValue: string;
  onPasswordChange: (value: string, field: string) => void;
  fieldName?: string;
  inputTitle?: string;
  inputPlaceholder?: string;
}

export function PasswordInput({ 
  passwordValue, 
  fieldName="password",
  onPasswordChange,
  inputTitle="Password:",
  inputPlaceholder="Enter your password",
}: PasswordInputProps) {

  const { inputValue, handleChange, handleBlur } = useInput(
    passwordValue,
    onPasswordChange,
    fieldName,
  );

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Field>
      <Label 
      className="block text-lg"
      >
        {inputTitle}
      </Label>
      <Input
        type={showPassword ? "text" : "password"}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="mt-1 block w-full rounded-md shadow dark:border border-slate-400 py-1 px-3 placeholder:font-thin
          bg-inherit placeholder:text-inherit text-inherit"
        placeholder={inputPlaceholder}
      /> 
      <button
        type="button"
        onClick={toggleShowPassword}
        className="flex items-center text-sm leading-5"
      >
        {showPassword ? "Hide" : "Show Password"}
      </button>
      </Field>
  );
}
