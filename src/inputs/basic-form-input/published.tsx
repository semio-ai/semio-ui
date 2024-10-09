import { Field, Checkbox, Label } from "@headlessui/react";
import { useBooleanInput } from "../../hooks/formInputHooks";

export interface PublishedInputProps {
  published: boolean;
  onPublishedChange: (value: boolean, field: string) => void;
  fieldName?: string;
  inputTitle?: string;
}

export function PublishedInput({
  published,
  onPublishedChange,
  fieldName = "published",
  inputTitle = "Published:",
}: PublishedInputProps) {
  const { inputValue, handleChange } = useBooleanInput(published, onPublishedChange, fieldName);

  return (
    <Field>
      <Label className="block text-lg">{inputTitle}</Label>
      <Checkbox
        checked={inputValue}
        onChange={handleChange}
        className="group inline-block size-4 rounded border bg-white data-[checked]:bg-tertiary-500"
      >
        {/* Checkmark icon */}
        <svg
          className="stroke-white opacity-0 group-data-[checked]:opacity-100"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Checkbox>
      <span className="m-1">{inputValue ? "Published" : "Not Published"}</span>
    </Field>
  );
}
