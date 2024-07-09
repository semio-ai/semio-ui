import { Field, Input, Label } from '@headlessui/react'
import { ChangeEvent } from "react";
import { useEmailsInput } from "../../hooks/formInputHooks";

export interface EmailsInputProps {
  emails: string[];
  fieldName?: string;
  onEmailsChange: (emails: string[], field: string) => void;
  inputPlaceholder?: string;
  inputTitle?: string;
}

export function EmailsInput({
  emails: initialEmails,
  fieldName="emails",
  onEmailsChange,
  inputTitle="",
  inputPlaceholder="Type an eamil and press 'enter' to add it to the list."
}: EmailsInputProps) {

  const {
    emails,
    inputValue,
    setInputValue,
    handleKeyDown,
    handleRemoveEmail,
    error,
  } = useEmailsInput(initialEmails, onEmailsChange, fieldName);

  return (
    <Field>
      <Label
        className="block text-lg"
      >
        {inputTitle}:
        {emails?.map((email, index) => (
          <div key={index} className="inline-block mx-2 rounded-lg text-base">
            {email}{" "}
            <button
              type="button"
              className="text-red-500"
              onClick={() => handleRemoveEmail(email)}
            >x</button>
          </div>
        ))}
      </Label>
      <Input
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setInputValue(e.target.value)
        }
        onKeyDown={handleKeyDown}
        className="mt-1 block w-full rounded-md shadow dark:border border-slate-400 py-1 px-3 placeholder:font-thin
          bg-inherit placeholder:text-inherit text-inherit"
        placeholder={inputPlaceholder}
      />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </Field>
  );
}