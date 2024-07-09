import { Field, Input, Label } from '@headlessui/react'
import { ChangeEvent } from "react";
import { useItemsInput } from "../../hooks/formInputHooks";

export interface StringsInputProps {
  strings: string[];
  fieldName: string;
  onStringsChange: (strings: string[], field: string) => void;
  inputPlaceholder?: string;
  inputTitle?: string;
}

export function StringsInput({
  strings,
  fieldName,
  onStringsChange,
  inputTitle="",
  inputPlaceholder="Type item and press 'enter' to add it to the list."
}: StringsInputProps) {
  const { items, inputValue, setInputValue, handleKeyDown, handleRemoveItem } =
    useItemsInput(strings, onStringsChange, fieldName);

  return (
    <Field>
      <Label
        className="block text-lg"
      >
        {inputTitle}:
        {items?.map((tag, index) => (
          <div key={index} className="inline-block mx-2 rounded-lg">
            {tag}{" "}
            <button
              type="button"
              className="text-red-500"
              onClick={() => handleRemoveItem(tag)}
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
    </Field>
  );
}
