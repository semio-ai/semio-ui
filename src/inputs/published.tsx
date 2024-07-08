import { Field, Label } from '@headlessui/react'
import { useBooleanInput } from "../hooks/formInputHooks";

export interface PublishedInputProps {
  published: boolean;
  onPublishedChange: (value: boolean, field: string) => void;
}

export function PublishedInput({
  published,
  onPublishedChange,
}: PublishedInputProps) {
  const { inputValue, handleChange } = useBooleanInput(
    published,
    onPublishedChange,
    "published",
  );

  return (
    <Field>
      <Label
        className="block text-lg"
      >
        Published:
      </Label>
      <input
        type="checkbox"
        id="published"
        checked={inputValue}
        onChange={handleChange}
        className="mr-2 leading-tight"
      />
      <span>{inputValue ? "Published" : "Not Published"}</span>
    </Field>
  );
}
