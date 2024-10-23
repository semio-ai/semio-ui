import { Field, Input, Label } from "@headlessui/react";
import { useEmailInput } from "../../hooks/formInputHooks";

export interface EmailInputProps {
  emailValue: string;
  onEmailChange: (value: string, field: string) => void;
  fieldName?: string;
  inputTitle?: string;
  inputPlaceholder?: string;
  inputSize?: number;
}

export function EmailInput({
  emailValue,
  onEmailChange,
  fieldName = "email",
  inputTitle = "Email:",
  inputPlaceholder = "example@abc.com",
}: EmailInputProps) {
  const { email, error, handleChange } = useEmailInput(emailValue, onEmailChange, fieldName);

  return (
    <Field>
      <Label className="block text-lg">{inputTitle}</Label>
      <Input
        value={email}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md shadow dark:border border-slate-400 py-1 px-3 placeholder:font-thin
          bg-inherit placeholder:text-inherit text-inherit"
        placeholder={inputPlaceholder}
      />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </Field>
  );
}
